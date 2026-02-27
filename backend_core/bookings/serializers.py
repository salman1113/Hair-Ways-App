from rest_framework import serializers
from .models import Booking, BookingItem, BarberQueue
from services.models import Service
from accounts.serializers import UserSerializer, EmployeeProfileSerializer
from datetime import datetime, timedelta, date


class ReviewReadSerializer(serializers.Serializer):
    """Lightweight read-only serializer for review data nested inside BookingSerializer."""
    id = serializers.IntegerField(read_only=True)
    rating = serializers.DecimalField(max_digits=3, decimal_places=1, read_only=True)
    comment = serializers.CharField(read_only=True)
    customer_name = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)


class BookingItemSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)
    service_duration = serializers.IntegerField(source='service.duration_minutes', read_only=True)
    
    class Meta:
        model = BookingItem
        fields = ['id', 'service', 'service_name', 'service_duration', 'price']

class BookingSerializer(serializers.ModelSerializer):
    items = BookingItemSerializer(many=True, read_only=True)
    customer_details = UserSerializer(source='customer', read_only=True)
    employee_details = EmployeeProfileSerializer(source='employee', read_only=True)
    service_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True)
    review = ReviewReadSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'token_number', 
            'customer', 'customer_details', 
            'guest_name', 'guest_phone', 'is_walk_in',
            'employee', 'employee_details',
            'booking_date', 'booking_time', 'status',
            'estimated_start_time', 'actual_start_time', 'actual_end_time',
            'total_price', 'created_at',
            'items', 'service_ids',
            'review'
        ]
        read_only_fields = ['token_number', 'total_price', 'created_at', 'status', 'actual_start_time', 'actual_end_time']
        validators = []  # Bypass DRF UniqueTogetherValidator to use custom validate() messages

    # Time Overlap Validation
    def validate(self, data):
        """
        Validates the booking time to ensure no overlap with existing appointments for the same employee.
        - Calculates the duration based on services selected.
        - Checks for conflicts in the database.
        """
        employee = data.get('employee')
        booking_date = data.get('booking_date')
        booking_time = data.get('booking_time')
        service_ids = data.get('service_ids')
        
        if not service_ids:
             raise serializers.ValidationError({"service_ids": "At least one service is required."})
        
        # Validate Service IDs existence
        valid_services_count = Service.objects.filter(id__in=service_ids, is_active=True).count()
        if valid_services_count != len(set(service_ids)):
             raise serializers.ValidationError({"service_ids": "One or more services are invalid or inactive."})

        # Temporal Validation: Prevent booking past times for today
        if booking_date and booking_time:
            from django.utils import timezone
            local_now = timezone.localtime() if timezone.is_aware(timezone.now()) else datetime.now()
            
            if booking_date < local_now.date():
                raise serializers.ValidationError({"booking_date": "Cannot book for a past date."})
            elif booking_date == local_now.date() and booking_time < local_now.time():
                raise serializers.ValidationError({"error": "Time Pass", "message": "Cannot book a slot in the past."})

        # --- NEW STRICT BUSINESS RULES ---
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            user = request.user
            
            # Admins and Employees should bypass strict daily limits when adding walk-ins
            if user.role == 'CUSTOMER':
                # Rule 1: Same-Time Clash Prevention
                if Booking.objects.filter(customer=user, booking_date=booking_date, booking_time=booking_time).exclude(status='CANCELLED').exists():
                    raise serializers.ValidationError({
                        "error": "Double Booking",
                        "message": "you have a booking same this time"
                    })

                # Rule 2: Maximum 2 Bookings Per Day
                if Booking.objects.filter(customer=user, booking_date=booking_date).exclude(status='CANCELLED').count() >= 2:
                    raise serializers.ValidationError({
                        "error": "Limit Reached",
                        "message": "You have reached the maximum limit of 2 bookings for this day."
                    })

        if employee and booking_date and booking_time:
            req_duration = 0
            if service_ids:
                services = Service.objects.filter(id__in=service_ids)
                req_duration = sum(s.duration_minutes for s in services)
            
            if req_duration == 0: req_duration = 30 # Default
            req_start_dt = datetime.combine(booking_date, booking_time)
            req_end_dt = req_start_dt + timedelta(minutes=req_duration)

            day_bookings = Booking.objects.filter(
                employee=employee,
                booking_date=booking_date,
                status__in=['PENDING', 'CONFIRMED', 'IN_PROGRESS']
            ).prefetch_related('items__service')


            for booking in day_bookings:
                exist_duration = sum(item.service.duration_minutes for item in booking.items.all())
                if exist_duration == 0: exist_duration = 30
                
                exist_start_dt = datetime.combine(booking.booking_date, booking.booking_time)
                exist_end_dt = exist_start_dt + timedelta(minutes=exist_duration)

                # (NewStart < OldEnd) AND (NewEnd > OldStart)
                if req_start_dt < exist_end_dt and req_end_dt > exist_start_dt:
                    suggested_time = exist_end_dt.time()
                    
                    raise serializers.ValidationError({
                        "error": "Slot Taken",
                        "message": f"Stylist is busy until {suggested_time.strftime('%H:%M')}.",
                        "suggested_time": suggested_time.strftime("%H:%M")
                    })

        return data

    def create(self, validated_data):
        """
        Custom Create Method:
        - Extracts `service_ids` to create related `BookingItem` entries.
        - Calculates the total price based on service prices.
        """
        service_ids = validated_data.pop('service_ids', [])
        booking = Booking.objects.create(**validated_data)
        
        total_price = 0
        for service_id in service_ids:
            try:
                service = Service.objects.get(id=service_id)
                BookingItem.objects.create(booking=booking, service=service, price=service.price)
                total_price += service.price
            except Service.DoesNotExist:
                continue
            
        booking.total_price = total_price
        booking.save()
        return booking

class BarberQueueSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.username', read_only=True)
    employee_image = serializers.ImageField(source='employee.user.profile_picture', read_only=True)
    
    class Meta:
        model = BarberQueue
        fields = ['id', 'employee', 'employee_name', 'employee_image', 'joined_at']
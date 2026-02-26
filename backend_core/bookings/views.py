from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db.models import Prefetch, Sum, F, Q
from django.utils import timezone
from django.db import transaction
from django.shortcuts import get_object_or_404
from datetime import datetime, date, timedelta
from .models import Booking, BookingItem
from .serializers import BookingSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

# --- CORE BOOKING APIS ---

class BookingListCreateApi(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('date', openapi.IN_QUERY, description="Filter bookings by date (YYYY-MM-DD)", type=openapi.TYPE_STRING)
        ],
        responses={200: BookingSerializer(many=True)}
    )
    def get(self, request):
        """
        List all bookings.
        - Admin/Staff: All bookings.
        - Customer: Only their own.
        - Filter by ?date=YYYY-MM-DD
        """
        queryset = Booking.objects.select_related(
            'customer', 'employee', 'employee__user'
        ).prefetch_related(
            'items__service'
        ).order_by('-booking_date', '-booking_time')

        date_param = request.query_params.get('date')
        if date_param:
            queryset = queryset.filter(booking_date=date_param)

        user = request.user
        if user.role in ['ADMIN', 'MANAGER']:
            pass
        elif user.role == 'EMPLOYEE':
             queryset = queryset.filter(employee__user=user)
        else:
            queryset = queryset.filter(customer=user)

        serializer = BookingSerializer(queryset, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        request_body=BookingSerializer,
        responses={201: BookingSerializer, 400: 'Bad Request'}
    )
    def post(self, request):
        """
        Create a new booking with atomic transaction and sequential token generation.
        """
        serializer = BookingSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            booking_date = serializer.validated_data.get('booking_date')

            # --- Sequential Token Logic ---
            daily_bookings = Booking.objects.filter(booking_date=booking_date).select_for_update()
            current_max = 0
            existing_tokens = list(Booking.objects.filter(booking_date=booking_date).values_list('token_number', flat=True))
            
            for token in existing_tokens:
                if token and token.startswith('T-'):
                    try:
                        num = int(token.split('-')[1])
                        if num > current_max: current_max = num
                    except (ValueError, IndexError):
                         pass
            
            token = f"T-{current_max + 1}"
            
            # --- Assignment Logic ---
            if request.user.role == 'CUSTOMER':
                 serializer.save(
                     customer=request.user, 
                     booking_type='Online',
                     is_walk_in=False, 
                     token_number=token,
                     guest_name=''
                 )
            else:
                # Admin/Employee creating booking (Quick Add API)
                guest_name = serializer.validated_data.get('guest_name', 'Walk-in Guest')
                if not guest_name:
                    guest_name = 'Walk-in Guest'
                
                serializer.save(
                    customer=None,
                    booking_type='Walk-in',
                    is_walk_in=True,
                    token_number=token,
                    guest_name=guest_name
                )
                
            return Response(serializer.data, status=status.HTTP_201_CREATED)

class BookingDetailApi(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        booking = get_object_or_404(Booking, pk=pk)
        # Permission Check
        if user.role not in ['ADMIN', 'MANAGER', 'EMPLOYEE'] and booking.customer != user:
             return None
        return booking

    def get(self, request, pk):
        booking = self.get_object(pk, request.user)
        if not booking: return Response({"error": "Not authorized"}, status=403)
        serializer = BookingSerializer(booking)
        return Response(serializer.data)

    def delete(self, request, pk):
        """Cancel Booking is preferred over Delete, but standard DELETE supported here."""
        booking = self.get_object(pk, request.user)
        if not booking: return Response({"error": "Not authorized"}, status=403)
        booking.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def patch(self, request, pk):
        """Allow Admins/Managers to manually update booking status with side effects."""
        booking = self.get_object(pk, request.user)
        if not booking: return Response({"error": "Not authorized"}, status=403)

        if request.user.role not in ['ADMIN', 'MANAGER']:
             return Response({"error": "Permission denied"}, status=403)

        data = request.data
        if 'status' in data:
            new_status = data['status']
            
            # 1. Handle "Start Job" Side Effects
            if new_status == 'IN_PROGRESS' and booking.status != 'IN_PROGRESS':
                booking.actual_start_time = timezone.now()
                if booking.employee:
                    booking.employee.is_available = False
                    booking.employee.save()
            
            # 2. Handle "Finish Job" Side Effects
            elif new_status == 'COMPLETED' and booking.status != 'COMPLETED':
                booking.actual_end_time = timezone.now()
                if booking.employee:
                    booking.employee.is_available = True
                    # Commission Logic
                    if booking.employee.commission_rate > 0:
                        commission = (booking.total_price * booking.employee.commission_rate) / 100
                        booking.employee.wallet_balance = F('wallet_balance') + commission
                    booking.employee.save()

            # 3. Handle "Cancel" Side Effects
            elif new_status == 'CANCELLED':
                if booking.status == 'IN_PROGRESS' and booking.employee:
                     booking.employee.is_available = True
                     booking.employee.save()

            booking.status = new_status
        
        booking.save()
        
        # Refresh to get updated values (like wallet balance derived from F expression)
        booking.refresh_from_db()
        serializer = BookingSerializer(booking)
        return Response(serializer.data)

# --- ACTION APIS ---

class BookingCancelApi(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        booking = get_object_or_404(Booking, pk=pk)
        
        # Auth check
        if request.user.role not in ['ADMIN', 'MANAGER'] and booking.customer != request.user:
             return Response({"error": "Not authorized"}, status=403)

        if booking.status in ['COMPLETED', 'CANCELLED']:
            return Response({'error': 'Cannot cancel this booking'}, status=400)
        
        booking.status = 'CANCELLED'
        booking.save()
        return Response({'status': 'Booking cancelled'})

class BookingRescheduleApi(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        booking = get_object_or_404(Booking, pk=pk)
        
        if booking.is_rescheduled: 
            return Response({"error": "Reschedule limit reached"}, status=400)
        
        # Simple logic: +15 mins
        current_datetime = datetime.combine(date.today(), booking.booking_time)
        new_time = (current_datetime + timedelta(minutes=15)).time()
        
        booking.booking_time = new_time
        booking.is_rescheduled = True
        booking.save()
        return Response({"status": "Rescheduled", "new_time": new_time})

class StartJobApi(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        with transaction.atomic():
            booking = get_object_or_404(Booking, pk=pk)
            
            # Auth check: Only assigned employee or Admin
            if request.user.role != 'ADMIN' and booking.employee.user != request.user:
                 return Response({"error": "Not authorized"}, status=403)

            if booking.status != 'CONFIRMED' and booking.status != 'PENDING':
                 return Response({"error": "Booking must be Pending/Confirmed to start"}, status=400)

            # 15-Minute Buffer: Prevent starting too early
            if booking.booking_date and booking.booking_time:
                from datetime import datetime as dt
                booking_datetime = timezone.make_aware(
                    dt.combine(booking.booking_date, booking.booking_time)
                ) if timezone.is_naive(dt.combine(booking.booking_date, booking.booking_time)) else dt.combine(booking.booking_date, booking.booking_time)
                
                earliest_start = booking_datetime - timedelta(minutes=15)
                now = timezone.localtime()

                if now < earliest_start:
                    mins_remaining = int((earliest_start - now).total_seconds() // 60)
                    return Response({
                        "error": f"Cannot start this service yet. You can start 15 minutes prior to the scheduled time ({booking.booking_time.strftime('%H:%M')}). Please wait {mins_remaining} more minute(s)."
                    }, status=400)

            booking.status = 'IN_PROGRESS'
            booking.actual_start_time = timezone.now()
            booking.save()

            if booking.employee:
                booking.employee.is_available = False
                booking.employee.save()

            return Response({"status": "Job Started", "start_time": booking.actual_start_time})

class FinishJobApi(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        with transaction.atomic():
            booking = get_object_or_404(Booking, pk=pk)
            
             # Auth check
            if request.user.role != 'ADMIN' and booking.employee.user != request.user:
                 return Response({"error": "Not authorized"}, status=403)

            if booking.status != 'IN_PROGRESS':
                return Response({"error": "Job is not in progress"}, status=400)
            
            booking.status = 'COMPLETED'
            booking.actual_end_time = timezone.now()
            booking.save()
            
            if booking.employee:
                booking.employee.is_available = True
                if booking.employee.commission_rate > 0:
                    commission = (booking.total_price * booking.employee.commission_rate) / 100
                    booking.employee.refresh_from_db()
                    booking.employee.wallet_balance += commission
                booking.employee.save()
                
            return Response({"status": "Job Finished"})

class BookingTrackApi(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        booking = get_object_or_404(Booking, pk=pk)
        
        if booking.status in ['COMPLETED', 'CANCELLED']:
             return Response({"status": booking.status, "message": "Booking is finished/cancelled"})

        if not booking.employee:
            return Response({"status": "Unassigned", "message": "Waiting for stylist assignment"})

        queue_ahead = Booking.objects.filter(
            employee=booking.employee,
            booking_date=booking.booking_date,
            status__in=['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
            booking_time__lt=booking.booking_time
        )
        
        customers_ahead = queue_ahead.count()
        
        est_minutes = 0
        for b in queue_ahead:
             duration = sum(item.service.duration_minutes for item in b.items.all())
             if duration == 0: duration = 30
             est_minutes += duration

        current_job = Booking.objects.filter(employee=booking.employee, status='IN_PROGRESS').first()
        stylist_status = "Free"
        if current_job:
            stylist_status = f"Busy with Token #{current_job.token_number}"
        
        return Response({
            "token": booking.token_number,
            "stylist": booking.employee.user.username,
            "stylist_status": stylist_status,
            "position_in_queue": customers_ahead + 1,
            "estimated_wait_minutes": est_minutes,
            "booking_status": booking.status
        })

# --- DASHBOARD APIS ---

class EmployeeDashboardApi(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if not hasattr(user, 'employee_profile'):
            return Response({"error": "Not an employee"}, status=403)
        
        profile = user.employee_profile
        today = timezone.now().date()
        
        todays_jobs = Booking.objects.filter(employee=profile, booking_date=today)
        completed = todays_jobs.filter(status='COMPLETED')
        pending = todays_jobs.filter(status__in=['PENDING', 'CONFIRMED', 'IN_PROGRESS']).order_by('booking_time')
        
        today_earnings = 0
        for job in completed:
            today_earnings += job.total_price

        return Response({
            "employee": user.username,
            "wallet_balance": profile.wallet_balance,
            "today_earnings": today_earnings,
            "jobs_completed": completed.count(),
            "queue_length": pending.count(),
            "next_customer": BookingSerializer(pending.first()).data if pending.exists() else None,
            "queue": BookingSerializer(pending, many=True).data
        })

class EmployeeAnalyticsApi(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if not hasattr(user, 'employee_profile'):
            return Response({"error": "Not an employee"}, status=403)
        
        profile = user.employee_profile
        date_param = request.query_params.get('date')
        
        queryset = Booking.objects.filter(employee=profile)
        if date_param:
            queryset = queryset.filter(booking_date=date_param)
            
        completed = queryset.filter(status='COMPLETED')
        
        total_earnings = 0
        for job in completed:
            total_earnings += job.total_price
                
        walk_ins = queryset.filter(booking_type='Walk-in').count()
        online = queryset.filter(booking_type='Online').count()

        return Response({
            "total_bookings": queryset.count(),
            "completed_jobs": completed.count(),
            "walk_ins": walk_ins,
            "online": online,
            "total_earnings": total_earnings
        })

class AdminAnalyticsApi(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'ADMIN':
            return Response({"error": "Admin only"}, status=403)
            
        date_param = request.query_params.get('date')
        if not date_param:
            today_date = timezone.now().date()
        else:
            try:
                today_date = datetime.strptime(date_param, '%Y-%m-%d').date()
            except ValueError:
                 today_date = timezone.now().date()
                 
        # 1. Total Base Queryset
        all_bookings = Booking.objects.all()
        
        # 2. Today's Bookings
        todays_bookings = all_bookings.filter(booking_date=today_date)
        
        # 3. Monthly Revenue
        current_month = today_date.month
        current_year = today_date.year
        monthly_bookings = all_bookings.filter(
            booking_date__month=current_month, 
            booking_date__year=current_year,
            status='COMPLETED'
        )
        monthly_rev = sum(b.total_price for b in monthly_bookings)
        
        # 4. Daily Revenue
        daily_completed = todays_bookings.filter(status='COMPLETED')
        daily_rev = sum(b.total_price for b in daily_completed)

        # 5. Customer Flow
        status_counts = {
            'pending': todays_bookings.filter(status='PENDING').count(),
            'in_progress': todays_bookings.filter(status='IN_PROGRESS').count(),
            'completed': daily_completed.count(),
            'cancelled': todays_bookings.filter(status='CANCELLED').count()
        }
        
        # 6. Source
        source = {
            'walk_ins': todays_bookings.filter(is_walk_in=True).count(),
            'online': todays_bookings.filter(is_walk_in=False).count()
        }

        # 7. Staff Status
        from accounts.models import EmployeeProfile # inline import to avoid circular dep if any
        emps = EmployeeProfile.objects.all()
        total_staff = emps.count()
        active_staff = emps.filter(is_available=True).count()
        
        busy_emps = set(todays_bookings.filter(status='IN_PROGRESS', employee__isnull=False).values_list('employee_id', flat=True))
        busy_staff = len(busy_emps)

        staff_status = {
            'total': total_staff,
            'active': active_staff,
            'busy': busy_staff
        }

        # 8. Hourly Volume Chart Data
        # Group bookings by hour of booking_time (for today)
        hourly_groups = {}
        for b in todays_bookings:
            if b.booking_time:
                # get HOUR format e.g 09, 14
                hr = b.booking_time.hour
                
                # Format into 12H string: "9 AM", "2 PM"
                ampm = "AM" if hr < 12 else "PM"
                hr_12 = hr if hr <= 12 else hr - 12
                if hr_12 == 0: hr_12 = 12
                label = f"{hr_12} {ampm}"
                
                hourly_groups[label] = hourly_groups.get(label, 0) + 1
        
        # Sort hours somewhat logically (9 AM -> 9 PM)
        # Note: A real implementation might enforce 0-24 sorting. For now we just return the dict mapped to a list.
        # But recharts expects an array of objects.
        
        # Let's generate a fixed array of hours 9AM to 9PM to ensure chart always has axis data
        hourly_volume = []
        for h in range(9, 21): # 9 to 20 (8 PM)
            hr_12 = h if h <= 12 else h - 12
            ampm = "AM" if h < 12 else "PM"
            label = f"{hr_12} {ampm}"
            
            hourly_volume.append({
                "time": label,
                "customers": hourly_groups.get(label, 0)
            })

        # 9. Employee Leaderboard
        employee_performance = {}
        for b in daily_completed:
            if b.employee:
                emp_name = b.employee.user.username
                employee_performance[emp_name] = employee_performance.get(emp_name, 0) + float(b.total_price)
        
        leaderboard = [
            {"employee": name, "total_work": amount} 
            for name, amount in sorted(employee_performance.items(), key=lambda item: item[1], reverse=True)
        ]

        return Response({
            "revenue": {
                "daily": daily_rev,
                "monthly": monthly_rev
            },
            "customer_flow": status_counts,
            "source": source,
            "staff_status": staff_status,
            "metrics": {
                "total_tokens": todays_bookings.count()
            },
            "hourly_volume": hourly_volume,
            "leaderboard": leaderboard
        })
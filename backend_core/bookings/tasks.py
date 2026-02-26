import time
from celery import shared_task
from django.core.mail import send_mail, EmailMessage
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import datetime
from .models import Booking
from accounts.models import User
from .pdf_generator import generate_daily_report_pdf

@shared_task
def send_booking_confirmation_email(booking_id):
    """
    Background task to send an email confirmation.
    Simulating a potentially slow 3rd party API call so it doesn't block the main thread.
    """
    try:
        # Simulate network latency or heavy processing
        time.sleep(2)
        
        booking = Booking.objects.get(id=booking_id)
        
        # Email Details
        subject = f"Booking Confirmation: Token #{booking.token_number}"
        message = (
            f"Hello {booking.guest_name or 'Valued Customer'},\n\n"
            f"Your booking has been received and confirmed.\n"
            f"Token Number: {booking.token_number}\n\n"
            f"Thank you for choosing Hair Ways!"
        )
        
        recipient_email = None
        if booking.customer and booking.customer.email:
            recipient_email = booking.customer.email
        
        if recipient_email:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [recipient_email],
                fail_silently=False,
            )
            return f"Successfully sent confirmation email to {recipient_email}"
        else:
            return f"No email assigned to booking {booking_id}. Skipping email."
            
    except Booking.DoesNotExist:
        return f"Booking {booking_id} no longer exists."
    except Exception as e:
        return f"Error sending email for booking {booking_id}: {str(e)}"

# ---------------------------------------------------------
# PERIODIC TASK 1: THE 15-MINUTE NO-SHOW SCANNER
# ---------------------------------------------------------
@shared_task
def auto_cancel_no_shows():
    """
    Runs every 5 minutes. 
    Scans for PENDING/CONFIRMED bookings where the scheduled start time 
    was more than 15 minutes ago.
    """
    now = timezone.localtime()
    today_date = now.date()
    current_time = now.time()
    
    # 15 minutes ago reference point
    time_threshold = (now - timedelta(minutes=15)).time()
    
    overdue_bookings = Booking.objects.filter(
        booking_date=today_date,
        booking_time__lt=time_threshold,
        status__in=['PENDING', 'CONFIRMED']
    )
    
    cancelled_count = 0
    
    for booking in overdue_bookings:
        booking.status = 'CANCELLED'
        booking.save()
        cancelled_count += 1
        
        # Determine email
        customer_email = None
        if booking.customer and booking.customer.email:
            customer_email = booking.customer.email
            
        if customer_email:
            send_mail(
                subject=f"Booking Cancelled (No-Show): Token #{booking.token_number}",
                message=(
                    f"Hello {booking.guest_name or 'Valued Customer'},\n\n"
                    f"Your appointment scheduled for {booking.booking_time.strftime('%I:%M %p')} has been automatically cancelled as you did not arrive within the 15-minute grace period.\n"
                    f"Please re-book through the Hair Ways portal if you still need service.\n\n"
                    f"Thank you!"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[customer_email],
                fail_silently=True
            )
            
    return f"Auto-cancelled {cancelled_count} overdue bookings."

# ---------------------------------------------------------
# PERIODIC TASK 2: NIGHTLY ADMIN PDF REPORT
# ---------------------------------------------------------
@shared_task
def generate_nightly_admin_report():
    """
    Runs daily at 23:59.
    Aggregates financial and performance data for the day, generates a PDF,
    and emails it to the Admin.
    """
    today_date = timezone.localtime().date()
    
    # Base Data
    todays_bookings = Booking.objects.filter(booking_date=today_date)
    completed = todays_bookings.filter(status='COMPLETED')
    cancelled = todays_bookings.filter(status='CANCELLED')
    
    total_rev = sum(b.total_price for b in completed)
    
    # Employee Performance Arary
    emp_stats = {}
    for b in completed:
        if b.employee:
            user_name = b.employee.user.username
            if user_name not in emp_stats:
                emp_stats[user_name] = {'jobs': 0, 'rev': 0.0}
            emp_stats[user_name]['jobs'] += 1
            emp_stats[user_name]['rev'] += float(b.total_price)
            
    emp_performance_arr = [
         {'name': name, 'completed_jobs': data['jobs'], 'revenue_generated': data['rev']}
         for name, data in emp_stats.items()
    ]
    
    # Construct dict for PDF generator
    report_data = {
        'date': today_date.strftime('%B %d, %Y'),
        'total_revenue': total_rev,
        'total_bookings': todays_bookings.count(),
        'completed_bookings': completed.count(),
        'cancelled_bookings': cancelled.count(),
        'employee_performance': sorted(emp_performance_arr, key=lambda x: x['revenue_generated'], reverse=True)
    }
    
    # Generate PDF in memory
    pdf_buffer = generate_daily_report_pdf(report_data)
    
    # Find active admin emails
    admin_emails = list(User.objects.filter(role='ADMIN').values_list('email', flat=True))
    
    if not admin_emails:
        return "No admins found to send report to."
        
    # Send Email with Attachment
    email = EmailMessage(
        subject=f"Hair Ways Salon: Daily Report for {report_data['date']}",
        body="Please find attached the automated daily summary report detailing today's salon performance and employee revenue breakdowns.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=admin_emails
    )
    
    # Attach the memory buffer as PDF
    email.attach(f"HairWays_Report_{today_date}.pdf", pdf_buffer.getvalue(), 'application/pdf')
    email.send(fail_silently=False)
    
    return f"Generated and sent Daily PDF Report for {today_date} to {len(admin_emails)} admins."

# ---------------------------------------------------------
# PERIODIC TASK 3: SMART APPOINTMENT REMINDERS
# ---------------------------------------------------------
@shared_task
def send_upcoming_booking_reminders():
    """
    Runs every 5 minutes.
    Emails customers when their PENDING/CONFIRMED appointment is <= 30 mins away
    and marks is_reminder_sent=True.
    """
    now = timezone.localtime()
    today_date = now.date()
    
    # 30 minutes from now reference point
    time_threshold = (now + timedelta(minutes=30)).time()
    
    upcoming_bookings = Booking.objects.filter(
        booking_date=today_date,
        booking_time__lte=time_threshold,
        booking_time__gte=now.time(),
        status__in=['PENDING', 'CONFIRMED'],
        is_reminder_sent=False
    )
    
    reminded_count = 0
    
    for booking in upcoming_bookings:
        # Prevent duplicate sends
        booking.is_reminder_sent = True
        booking.save()
        reminded_count += 1
        
        customer_email = None
        # Handle guest walkins or online customers
        if booking.customer and booking.customer.email:
            customer_email = booking.customer.email
            
        if customer_email:
            stylist_name = booking.employee.user.username if booking.employee else "our expert team"
            # Get first service name for email context if exists
            service_name = "your service"
            first_item = booking.items.first()
            if first_item and first_item.service:
                service_name = first_item.service.name

            send_mail(
                subject=f"Reminder: Upcoming Appointment at Hair Ways (Token #{booking.token_number})",
                message=(
                    f"Hello {booking.guest_name or 'Valued Customer'},\n\n"
                    f"This is a friendly reminder that your appointment for {service_name} with {stylist_name} "
                    f"is starting soon at {booking.booking_time.strftime('%I:%M %p')}.\n\n"
                    f"We look forward to seeing you shortly!\n\n"
                    f"Thank you, The Hair Ways Team"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[customer_email],
                fail_silently=True
            )
            
    return f"Sent {reminded_count} smart upcoming booking reminders."

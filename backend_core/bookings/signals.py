from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Booking
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .tasks import send_booking_confirmation_email


def _broadcast(groups, payload):
    """Send a notification payload to multiple channel groups."""
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return
    for group in groups:
        try:
            async_to_sync(channel_layer.group_send)(group, payload)
        except Exception as e:
            print(f"WS broadcast error to {group}: {e}", flush=True)


def _get_employee_user_id(instance):
    """Safely resolve the User.id behind an EmployeeProfile FK."""
    try:
        if instance.employee_id:
            return instance.employee.user_id
    except Exception:
        pass
    return None


def _build_groups(instance):
    """Build the target group list for a booking instance."""
    groups = ['admin_notifications']
    emp_uid = _get_employee_user_id(instance)
    if emp_uid:
        groups.append(f'employee_{emp_uid}_notifications')
    if instance.customer_id:
        groups.append(f'customer_{instance.customer_id}_notifications')
    return groups


@receiver(post_save, sender=Booking)
def send_booking_notification(sender, instance, created, **kwargs):
    # ───────────────────────────────────────
    # 1. NEW BOOKING CREATED
    # ───────────────────────────────────────
    if created:
        message = f"New booking received! Token #{instance.token_number}"
        if instance.guest_name:
            message += f" ({instance.guest_name})"

        _broadcast(_build_groups(instance), {
            'type': 'send_notification',
            'message': message,
            'booking_id': instance.id,
            'status': instance.status,
            'action': 'refresh',
        })

        # Trigger confirmation email
        send_booking_confirmation_email.delay(instance.id)
        return

    # ───────────────────────────────────────
    # 2. STATUS UPDATES (any change after create)
    # ───────────────────────────────────────
    STATUS_MESSAGES = {
        'CONFIRMED': f"Booking confirmed! Token #{instance.token_number}",
        'IN_PROGRESS': f"Service started for Token #{instance.token_number}",
        'COMPLETED': f"Service completed! Token #{instance.token_number}",
        'CANCELLED': f"Booking cancelled — Token #{instance.token_number}",
    }

    message = STATUS_MESSAGES.get(instance.status)
    if not message:
        return

    action = 'refresh_wallet' if instance.status == 'COMPLETED' else 'refresh'

    _broadcast(_build_groups(instance), {
        'type': 'send_notification',
        'message': message,
        'booking_id': instance.id,
        'status': instance.status,
        'action': action,
    })





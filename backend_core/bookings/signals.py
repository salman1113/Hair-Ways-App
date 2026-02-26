from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Booking
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import json
from .tasks import send_booking_confirmation_email

@receiver(post_save, sender=Booking)
def send_booking_notification(sender, instance, created, **kwargs):
    if created:
        print(f"DEBUG_WS: Signal triggered for booking {instance.id}", flush=True)
        channel_layer = get_channel_layer()
        print(f"DEBUG_WS: Channel layer is {channel_layer}", flush=True)
        if channel_layer is not None:
            # Add service details or basic info for the toast
            message = f"New booking received! Token #{instance.token_number}"
            if instance.guest_name:
                message += f" ({instance.guest_name})"
            
            print(f"DEBUG_WS: Sending message to group admin_notifications: {message}", flush=True)
                
            async_to_sync(channel_layer.group_send)(
                'admin_notifications',
                {
                    'type': 'send_notification',
                    'message': message,
                    # We can send the whole booking ID to trigger refetch
                    'booking_id': instance.id  
                }
            )
            print("DEBUG_WS: Message successfully sent to channel layer.", flush=True)
            
            print("DEBUG_WS: Message successfully sent to channel layer.", flush=True)
            
        # Trigger the Celery Background Task
        print(f"DEBUG_WS: Queuing background email task for booking {instance.id}", flush=True)
        send_booking_confirmation_email.delay(instance.id)

    # Check for Booking Completion to trigger Wallet Updates
    elif instance.status == 'COMPLETED':
        channel_layer = get_channel_layer()
        if channel_layer is not None:
            async_to_sync(channel_layer.group_send)(
                'admin_notifications',
                {
                    'type': 'send_notification',
                    'message': f"Job completed! Earnings updated for Token #{instance.token_number}.",
                    'booking_id': instance.id,
                    'action': 'refresh_wallet'
                }
            )

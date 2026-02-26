import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = 'admin_notifications'
        print(f"DEBUG_WS: Consumer connecting. Channel name: {self.channel_name}", flush=True)

        await self.accept()
        print("DEBUG_WS: Consumer accepted connection.", flush=True)

        try:
            # Join room group
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
            print("DEBUG_WS: Group add success.", flush=True)
        except Exception as e:
            print(f"DEBUG_WS: Error adding to group: {e}", flush=True)

    async def disconnect(self, close_code):
        print(f"DEBUG_WS: Consumer disconnecting. Code: {close_code}", flush=True)
        # Leave room group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    # Receive message from room group
    async def send_notification(self, event):
        message = event['message']
        print(f"DEBUG_WS: Consumer received message from group: {message}", flush=True)

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))
        print("DEBUG_WS: Message sent down the WebSocket to the client.", flush=True)

import json
from channels.generic.websocket import AsyncWebsocketConsumer


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.role = self.scope['url_route']['kwargs']['role']
        self.user_id = self.scope['url_route']['kwargs']['user_id']

        # Build the list of groups this connection should join
        self.groups_list = []

        if self.role in ('admin', 'manager'):
            # Admins see everything
            self.groups_list.append('admin_notifications')

        elif self.role == 'employee':
            # Employees get their own channel + global admin broadcast
            self.groups_list.append(f'employee_{self.user_id}_notifications')
            self.groups_list.append('admin_notifications')

        elif self.role == 'customer':
            # Customers only get their own channel
            self.groups_list.append(f'customer_{self.user_id}_notifications')

        print(f"WS: {self.role}/{self.user_id} joining groups: {self.groups_list}", flush=True)

        try:
            for group in self.groups_list:
                await self.channel_layer.group_add(group, self.channel_name)
        except Exception as e:
            print(f"WS: Error joining groups: {e}", flush=True)
            return

        await self.accept()

    async def disconnect(self, close_code):
        for group in self.groups_list:
            await self.channel_layer.group_discard(group, self.channel_name)

    # Handler called when group_send uses type='send_notification'
    async def send_notification(self, event):
        await self.send(text_data=json.dumps({
            'message': event.get('message', ''),
            'booking_id': event.get('booking_id'),
            'status': event.get('status'),
            'action': event.get('action', 'refresh'),
        }))

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Dynamic: ws/notifications/<role>/<user_id>/
    re_path(r'ws/notifications/(?P<role>\w+)/(?P<user_id>\d+)/$', consumers.NotificationConsumer.as_asgi()),
]

from django.urls import path
from .consumers import TestChatConsumer

websocket_urlpatterns = [
    path('ws/tests/<int:test_id>/chat/', TestChatConsumer.as_asgi()),
]
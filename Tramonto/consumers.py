from channels.generic.websocket import AsyncWebsocketConsumer
import json
from datetime import datetime

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.test_id = self.scope['url_route']['kwargs']['test_id']
            self.room_group_name = f"chat_{self.test_id}"
            print(f"self: {self.scope}")
            print(f"websocketaaa connected to test {self.test_id}")
            print(f"User in scope during connect: {self.scope['user']}")  # Debugging

            # Join the room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()
        except Exception as e:
            print(f"Error in connect: {e}")
            await self.close()
    async def disconnect(self, close_code):
        # Leave the room group
        print(f"WebSocket disconnected for test {self.test_id}, close_code: {close_code}")

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        print("só mais um teste")
        from .models import ChatMessage, Users  # Import your custom Users model
        data = json.loads(text_data)
        print(f"Received data: {data}")  # Debugging
        message = data['message']
        sender = self.scope['user']
        if sender.is_authenticated:
            sender_username = sender.username
        else:
            sender_username = "Anonymous"

        print(f"Message received from {sender_username}: {message}")

        # Save the message to the database
        '''
        ChatMessage.objects.create(
            test_id=self.test_id,
            sender=sender,
            message=message
        )
        '''
        # Broadcast the message to the room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': sender_username,
            }
        )

    async def chat_message(self, event):
        message = event['message']
        sender = event['sender']
        timestamp = event['timestamp']
        print(f"Broadcasting message: {message} from {sender}")  # Debugging

        # Send the message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'sender': sender,
            'timestamp': timestamp,
        
        }))
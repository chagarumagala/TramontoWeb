import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatMessage, Users

class TestChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.test_id = self.scope['url_route']['kwargs']['test_id']
        self.room_group_name = f"test_chat_{self.test_id}"
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        print(f"WebSocket connected to room: {self.room_group_name}")
        
        # Send message history when user connects
        await self.send_message_history()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        print(f"WebSocket disconnected from room: {self.room_group_name}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message = data.get('message', '')
            username = data.get('username', 'Anonymous')

            if not message.strip():
                return

            # Save message to database
            saved_message = await self.save_message(message, username)
            
            if saved_message:
                # Broadcast the message to the room group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': message,
                        'username': username,
                        'timestamp': self.get_timestamp(saved_message.timestamp),
                        'message_id': saved_message.id,
                    }
                )
        except Exception as e:
            print(f"Error in receive: {e}")

    async def chat_message(self, event):
        message = event['message']
        username = event['username']
        timestamp = event['timestamp']
        message_id = event.get('message_id')

        # Send the message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': message,
            'username': username,
            'timestamp': timestamp,
            'id': message_id,
        }))

    @database_sync_to_async
    def save_message(self, message, username):
        try:
            # Get the user by username
            user = Users.objects.get(name=username)
            
            # Create and save the message
            chat_message = ChatMessage.objects.create(
                test_id=self.test_id,
                sender=user,
                message=message
            )
            return chat_message
        except Users.DoesNotExist:
            print(f"User {username} not found")
            return None
        except Exception as e:
            print(f"Error saving message: {e}")
            return None

    @database_sync_to_async
    def get_message_history(self):
        try:
            print(f"Getting message history for test_id: {self.test_id}")

            messages = ChatMessage.objects.filter(
                test_id=self.test_id
            ).select_related('sender').order_by('timestamp')[:50]  # Last 50 messages
            print(f"Found {messages.count()} messages")

            message_list = [{
                'id': msg.id,
                'message': msg.message,
                'username': msg.sender.name,  # Make sure this matches your User model field
                'timestamp': self.get_timestamp(msg.timestamp),
                'type': 'message'
            } for msg in messages]
            
            print(f"Processed message list: {len(message_list)} messages")
            return message_list
        except Exception as e:
            print(f"Error getting message history: {e}")
            return []

    async def send_message_history(self):
        try:
            print("Starting to get message history...")
            history = await self.get_message_history()
            
            print(f"Got history with {len(history)} messages")
            
            await self.send(text_data=json.dumps({
                'type': 'message_history',
                'messages': history
            }))
            
            print("Message history sent successfully")
            
        except Exception as e:
            print(f"Error sending message history: {e}")
            import traceback
            traceback.print_exc()
            
            # Send empty history if there's an error
            await self.send(text_data=json.dumps({
                'type': 'message_history',
                'messages': []
            }))

    def get_timestamp(self, dt=None):
        from datetime import datetime
        if dt:
            return dt.strftime('%H:%M')
        return datetime.now().strftime('%H:%M')
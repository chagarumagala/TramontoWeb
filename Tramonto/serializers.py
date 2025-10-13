from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import *
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['is_client'] = user.is_client  # Add the is_client field to the token
        token['name'] = user.name  # Optionally include the user's name
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['is_client'] = self.user.is_client  # Include is_client in the response body
        data['name'] = self.user.name  # Optionally include the user's name
        return data
from rest_framework import serializers
from .models import Tests

class TestsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tests
        fields = '__all__' 
class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ('id', 'username')
class ConversationSerializer(serializers.ModelSerializer):
    participants = UserListSerializer(many=True, read_only=True)
    class Meta:
        model = Conversation
        fields = ('id', 'participants', 'created_at')

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        return representation

class MessageSerializer(serializers.ModelSerializer):
    sender = UserListSerializer()
    participants = serializers.SerializerMethodField()
    class Meta:
        model = Message
        fields = ('id', 'conversation', 'sender', 'content', 'timestamp', 'participants')

    def get_participants(self, obj):
        return UserListSerializer(obj.conversation.participants.all(), many=True).data


class CreateMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ('conversation', 'content')
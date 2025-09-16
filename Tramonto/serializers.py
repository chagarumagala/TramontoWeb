from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

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
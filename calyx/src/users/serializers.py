from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('pk', 'username', 'email', 'password','screen_name', 'gpa', 'is_admin', 'joined')
        extra_kwargs = {
            'joined': {'read_only': True},
            'is_admin': {'read_only': True},
            'email': {'read_only': True},
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        """Create new user"""
        return User.all_objects.create_user(**validated_data)

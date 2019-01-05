from django.db import IntegrityError
from rest_framework import serializers
from .models import User
from courses.serializers import CourseWithoutUserSerializer


class UserSerializer(serializers.ModelSerializer):

    is_admin = serializers.SerializerMethodField(read_only=True)
    joined = serializers.SerializerMethodField(read_only=True)
    courses = CourseWithoutUserSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ('pk', 'username', 'email', 'password', 'screen_name', 'gpa', 'is_admin', 'joined', 'courses')
        extra_kwargs = {
            'is_admin': {'read_only': True},
            'email': {'read_only': True},
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        """Create new user"""
        try:
            return User.objects.create_user(**validated_data)
        except IntegrityError:
            raise serializers.ValidationError({'username': 'このユーザは既に登録されています．'})

    def get_joined(self, obj):
        """課程に参加しているかどうかのフラグ"""
        return obj.courses.count() > 0

    def get_is_admin(self, obj):
        """課程のadminかどうかのフラグ"""
        course = obj.courses.first()
        if course is None:
            return False
        return obj.groups.filter(name=course.admin_group_name).exists()

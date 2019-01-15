from django.db import IntegrityError
from django.core import exceptions as django_exceptions
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import User, StudentNumberValidator
from courses.serializers import CourseWithoutUserSerializer


class UserSerializer(serializers.ModelSerializer):

    is_admin = serializers.SerializerMethodField(read_only=True)
    joined = serializers.SerializerMethodField(read_only=True)
    courses = CourseWithoutUserSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ('pk', 'username', 'email', 'screen_name', 'gpa', 'is_admin', 'joined', 'courses')
        extra_kwargs = {
            'username': {'read_only': True},
            'email': {'read_only': True},
        }

    def get_joined(self, obj):
        """課程に参加しているかどうかのフラグ"""
        return obj.courses.count() > 0

    def get_is_admin(self, obj):
        """課程のadminかどうかのフラグ"""
        course = obj.courses.first()
        if course is None:
            return False
        return obj.groups.filter(name=course.admin_group_name).exists()


class UserCreateSerializer(serializers.ModelSerializer):
    """ユーザを作成するためのシリアライザ"""

    class Meta:
        model = User
        fields = ('username', 'password', 'screen_name', 'email')
        extra_kwargs = {
            'password': {
                'write_only': True,
                'style': {'input_type': 'password'}
            },
            'screen_name': {
                'required': False,
            },
            'email': {
                'read_only': True
            }
        }

    def validate_username(self, data):
        validator = StudentNumberValidator()
        try:
            validator(data)
        except django_exceptions.ValidationError as e:
            raise serializers.ValidationError(''.join(e))
        return data

    def validate_password(self, data):
        try:
            validate_password(data)
        except django_exceptions.ValidationError as e:
            raise serializers.ValidationError(''.join(e))
        return data

    def create(self, validated_data):
        """新規ユーザを作成する"""
        try:
            return User.objects.create_user(**validated_data)
        except IntegrityError:
            raise serializers.ValidationError({'username': 'このユーザは既に登録されています．'})


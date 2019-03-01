import functools

from django.contrib.auth import password_validation
from django.contrib.auth.password_validation import validate_password
from django.core import exceptions as django_exceptions
from django.conf import settings
from django.db import IntegrityError
from rest_framework import serializers

from courses.serializers import CourseWithoutUserSerializer
from .models import User, StudentNumberValidator


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

    def update(self, instance, validated_data):
        for key, val in validated_data.items():
            setattr(instance, key, val)
        instance.save(update_fields=validated_data.keys())
        return instance

    def get_joined(self, obj) -> bool:
        """課程に参加しているかどうかのフラグ"""
        return obj.courses.count() > 0

    def get_is_admin(self, obj) -> bool:
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


@functools.lru_cache(maxsize=None)
def get_pin_code_validators():
    return password_validation.get_password_validators(settings.PIN_CODE_VALIDATORS)


class PasswordValidationSerializer(serializers.Serializer):
    """
    パスワードのチェックを行うシリアライザー
    """

    supported_types = ('user', 'pin_code')

    type = serializers.CharField(required=True)
    password = serializers.CharField(style={'input_type': 'password'}, required=True)

    def validate_type(self, data):
        if data not in self.supported_types:
            raise serializers.ValidationError(
                {
                    'type': f"'{data}'はサポートされていません．"
                    f"以下のいずれかを入力してください．[{', '.join(self.supported_types)}]"
                }
            )
        return data

    def validate(self, data):
        password = data.get('password')
        type_ = data.get('type')
        try:
            if type_ == self.supported_types[0]:
                validators = None
            else:
                validators = get_pin_code_validators()
            validate_password(password, password_validators=validators)
        except django_exceptions.ValidationError as e:
            raise serializers.ValidationError({'password': [*e]})
        return data

    def create(self, validated_data):
        return validated_data

    def update(self, instance, validated_data):
        raise NotImplementedError

    def to_representation(self, instance):
        instance['password'] = 'ok'
        return instance

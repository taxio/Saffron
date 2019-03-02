import functools

from django.conf import settings
from django.contrib.auth import get_user_model, password_validation
from django.core import exceptions
from django.db import IntegrityError
from drf_yasg.utils import swagger_serializer_method
from rest_framework import serializers

from courses.models import Course, Year, Config
from .user import UserSerializer

User = get_user_model()


@functools.lru_cache(maxsize=None)
def get_pin_code_validators():
    return password_validation.get_password_validators(settings.PIN_CODE_VALIDATORS)


def validate_pin_code(pin_code: str):
    try:
        password_validation.validate_password(pin_code, password_validators=get_pin_code_validators())
    except exceptions.ValidationError as e:
        raise serializers.ValidationError(str(e))
    return pin_code



class ConfigSerializer(serializers.ModelSerializer):
    """
    課程ごとの表示設定のシリアライザ．
    """

    parent_lookup_kwargs = {
        'course_pk': 'course_id'
    }

    class Meta:
        model = Config
        fields = ("show_gpa", "show_username", "rank_limit")


class ReadOnlyCourseSerializer(serializers.ModelSerializer):
    """
    課程をJsonにシリアライズするのみのシリアライザ．年度はリレーション先から年度の数字のみを取得して返す．
    所属するユーザはそのプライマリキーと学生IDのみを返す．
    """
    users = serializers.SerializerMethodField(read_only=True)
    year = serializers.IntegerField(source='year.year', read_only=True)
    config = ConfigSerializer(read_only=True)
    is_admin = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Course
        fields = ("pk", "name", "users", "year", "config", "is_admin")

    @swagger_serializer_method(serializer_or_field=UserSerializer(many=True))
    def get_users(self, obj):
        users = obj.users.prefetch_related('groups').all()
        group_name = obj.admin_group_name
        return [
            {
                'username': user.username,
                'pk': user.pk,
                'is_admin': user.groups.filter(name=group_name).exists()
            } for user in users
        ]

    def get_is_admin(self, obj) -> bool:
        try:
            user = self.context['request'].user
        except KeyError:
            return False
        group_name = obj.admin_group_name
        return user.groups.filter(name=group_name).exists()


class CourseCreateSerializer(serializers.ModelSerializer):
    """
    課程を作成するためのシリアライザ
    """

    year = serializers.IntegerField()
    config = ConfigSerializer(required=False)

    class Meta:
        model = Course
        fields = ("pk", "name", "pin_code", "year", "config")
        extra_kwargs = {
            'pin_code': {'write_only': True}
        }

    def validate_pin_code(self, data):
        return validate_pin_code(data)

    def create(self, validated_data):
        try:
            course = Course.objects.create_course(**validated_data)
            if 'request' in self.context.keys():
                course.join(self.context['request'].user, validated_data['pin_code'])
            return course
        except IntegrityError:
            raise serializers.ValidationError({'name': f'{validated_data["name"]}は既に存在しています．'})


class CourseUpdateSerializer(serializers.ModelSerializer):
    """
    課程の情報を更新するためのシリアライザ．年度，PINコードの変更は出来ない．
    """
    config = ConfigSerializer(required=False)

    class Meta:
        model = Course
        fields = ("pk", "name", "config")

    def update(self, instance, validated_data):
        try:
            pin_code = validated_data.pop('pin_code')
            instance.set_password(pin_code)
        except KeyError:
            pass
        # configはOrderedDict
        if 'config' in validated_data:
            config = validated_data.get('config')
            if not isinstance(config, Config):
                config, _ = Config.objects.update_or_create(course=instance, defaults=config)
            instance.config = config
            validated_data.pop('config')
        for key, val in validated_data.items():
            setattr(instance, key, val)
        instance.save(update_fields=validated_data.keys())
        return instance


class CourseWithoutUserSerializer(serializers.ModelSerializer):
    """
    ユーザの情報を含まないCourseSerializer
    """

    year = serializers.IntegerField(source='year.year')
    config = ConfigSerializer(read_only=True)

    class Meta:
        model = Course
        fields = ("pk", "name", "year", "config")

    def create(self, validated_data):
        raise NotImplementedError("This method is not supported in this serializer.")

    def update(self, instance, validated_data):
        raise NotImplementedError("This method is not supported in this serializer.")


class YearSerializer(serializers.ModelSerializer):
    """
    年度の数字と課程の一覧を返す．
    """

    courses = CourseWithoutUserSerializer(many=True, read_only=True)

    class Meta:
        model = Year
        fields = ("pk", "year", "courses")


class PINCodeSerializer(serializers.Serializer):
    """
    PINコードを取得する
    """

    pin_code = serializers.CharField(required=True, write_only=True)

    class Meta:
        fields = ("pin_code",)


class PINCodeUpdateSerializer(PINCodeSerializer):

    def validate_pin_code(self, data):
        return validate_pin_code(data)

    def update(self, instance: 'Course', validated_data):
        """課程を受け取ってPOSTされたPINコードで課程のPINコードを上書きする"""
        instance.set_password(validated_data['pin_code'])
        instance.save(update_fields=['pin_code'])
        return instance

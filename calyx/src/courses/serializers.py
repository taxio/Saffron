import functools
from django.core import exceptions
from django.contrib.auth import get_user_model, password_validation
from django.conf import settings
from rest_framework import serializers
from .models import Course, Year


User = get_user_model()


@functools.lru_cache(maxsize=None)
def get_pin_code_validators():
    return password_validation.get_password_validators(settings.PIN_CODE_VALIDATORS)


class CourseSerializer(serializers.ModelSerializer):
    """
    課程のシリアライザ．年度はリレーション先から年度の数字のみを取得して返す．
    所属するユーザはそのプライマリキーのみを返す．
    """

    users = serializers.SerializerMethodField()
    year = serializers.IntegerField(source='year.year')

    class Meta:
        model = Course
        fields = ("pk", "name", "users", "pin_code", "year")
        extra_kwargs = {
            'pin_code': {'write_only': True}
        }

    def create(self, validated_data):
        validated_data['year'] = validated_data['year']['year']
        return Course.objects.create_course(**validated_data)

    def validate_pin_code(self, data):
        try:
            password_validation.validate_password(data, password_validators=get_pin_code_validators())
        except exceptions.ValidationError as e:
            raise serializers.ValidationError(str(e))
        return data

    def get_users(self, obj):
        users = obj.users.all()
        return [
            {'username': user.username, 'pk': user.pk} for user in users
        ]


class CourseWithoutUserSerializer(serializers.ModelSerializer):
    """
    ユーザの情報を含まないCourseSerializer
    """

    year = serializers.IntegerField(source='year.year')

    class Meta:
        model = Course
        fields = ("pk", "name", "year")

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



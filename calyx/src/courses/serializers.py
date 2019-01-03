import functools
from django.core import exceptions
from django.db import IntegrityError
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
    所属するユーザはそのプライマリキーと学生IDのみを返す．
    """

    users = serializers.SerializerMethodField(read_only=True)
    year = serializers.IntegerField(source='year.year')

    class Meta:
        model = Course
        fields = ("pk", "name", "users", "pin_code", "year")
        extra_kwargs = {
            'pin_code': {'write_only': True}
        }

    def create(self, validated_data):
        # yearは{'year': {'year': 20xx}}という辞書になっている
        validated_data['year'] = validated_data['year']['year']
        try:
            course = Course.objects.create_course(**validated_data)
            if 'request' in self.context.keys():
                course.join(self.context['request'].user, validated_data['pin_code'])
            return course
        except IntegrityError:
            raise serializers.ValidationError({'name': f'{validated_data["name"]}は既に存在しています．'})

    def update(self, instance, validated_data):
        try:
            pin_code = validated_data.pop('pin_code')
            instance.set_password(pin_code)
        except KeyError:
            pass
        # yearは{'year': {'year': 20xx}}という辞書になっている
        year = validated_data.get('year', instance.year.year)
        if isinstance(year, dict):
            year = year.get('year')
        validated_data['year'], _ = Year.objects.get_or_create(year=year)

        for key, val in validated_data.items():
            setattr(instance, key, val)
        instance.save()
        return instance

    def validate_pin_code(self, data):
        try:
            password_validation.validate_password(data, password_validators=get_pin_code_validators())
        except exceptions.ValidationError as e:
            raise serializers.ValidationError(str(e))
        return data

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



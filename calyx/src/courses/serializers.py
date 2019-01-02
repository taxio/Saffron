from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Course, Year


User = get_user_model()


class CourseSerializer(serializers.ModelSerializer):
    """
    課程のシリアライザ．年度はリレーション先から年度の数字のみを取得して返す．
    所属するユーザはそのプライマリキーのみを返す．
    """

    users = serializers.PrimaryKeyRelatedField(read_only=True)
    year = serializers.IntegerField(source='year.year')

    class Meta:
        model = Course
        fields = ("pk", "name", "users", "pin_code", "year")
        extra_kwargs = {
            'pin_code': {'write_only': True}
        }


class CourseWithoutUserSerializer(serializers.ModelSerializer):
    """
    ユーザの情報を含まないCourseSerializer
    """

    year = serializers.IntegerField(source='year.year')

    class Meta:
        model = Course
        fields = ("pk", "name", "pin_code", "year")
        extra_kwargs = {
            'pin_code': {'write_only': True}
        }


class YearSerializer(serializers.ModelSerializer):
    """
    年度の数字と課程の一覧を返す．
    """

    courses = CourseWithoutUserSerializer(many=True, read_only=True)

    class Meta:
        model = Year
        fields = ("pk", "year", "courses")



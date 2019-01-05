from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import serializers
from courses.models import Course, Year
from courses.serializers import YearSerializer, CourseSerializer, CourseWithoutUserSerializer
from .base import DatasetMixin

User = get_user_model()


class YearSerializerTest(DatasetMixin, TestCase):

    def test_serialize(self):
        """YearモデルのJSONへの変換"""
        year = Year.objects.create(year=self.years[0])
        serializer = YearSerializer(year)
        expected_json = {
            'pk': year.pk,
            'year': self.years[0],
            'courses': []
        }
        self.assertEqual(expected_json, serializer.data)

    def test_serialize_with_course(self):
        """Courseモデルを含むYearモデルのJSONへの変換"""
        data = self.course_data_set[0]
        course = Course.objects.create_course(**data)
        serializer = YearSerializer(course.year)
        expected_json = {
            'pk': course.year.pk,
            'year': data['year'],
            'courses': [
                {
                    'pk': course.pk,
                    'name': data['name'],
                    'year': data['year']
                }
            ]
        }
        self.assertEqual(expected_json, serializer.data)

    def test_deserialize(self):
        """JSONをYearモデルに変換"""
        for year_int in self.years:
            serializer = YearSerializer(data={'year': year_int})
            serializer.is_valid()
            serializer.save()
        self.assertEqual(len(self.years), Year.objects.count())
        for y_int, year in zip(self.years, Year.objects.order_by('year').all()):
            self.assertEqual(y_int, year.year)


class CourseWithoutUserSerializerTest(DatasetMixin, TestCase):

    def test_serialize(self):
        """CourseモデルをJSONへ変換"""
        course_data = self.course_data_set[0]
        course = Course.objects.create_course(**course_data)
        serializer = CourseWithoutUserSerializer(course)
        expected_json = {
            'pk': course.pk,
            'name': course.name,
            'year': course.year.year
        }
        self.assertEqual(expected_json, serializer.data)


class CourseSerializerTest(DatasetMixin, TestCase):

    def test_serialize(self):
        """CourseモデルをJSONへ変換"""
        course_data = self.course_data_set[0]
        course = Course.objects.create_course(**course_data)
        serializer = CourseSerializer(course)
        expected_json = {
            'pk': course.pk,
            'name': course.name,
            'year': course.year.year,
            'users': []
        }
        self.assertEqual(expected_json, serializer.data)

    def test_serialize_with_user(self):
        """ユーザ情報を含めてCourseモデルをJSONへ変換"""
        course_data = self.course_data_set[0]
        course = Course.objects.create_course(**course_data)
        user = User.objects.create_user(**self.user_data_set[0])
        course.join(user, course_data['pin_code'])
        serializer = CourseSerializer(course)
        expected_json = {
            'pk': course.pk,
            'name': course.name,
            'year': course.year.year,
            'users': [
                {
                    'pk': user.pk,
                    'username': user.username,
                    'is_admin': False
                }
            ]
        }
        self.assertEqual(expected_json, serializer.data)

    def test_deserialize(self):
        """JSONからCourseモデルへ変換"""
        course_data = self.course_data_set[0]
        serializer = CourseSerializer(data=course_data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        course = Course.objects.first()
        self.assertEqual(1, Course.objects.count())
        self.assertEqual(course_data['name'], course.name)
        self.assertEqual(course_data['year'], course.year.year)

    def test_cannot_deserialize(self):
        """形式の間違ったJSONや，値が不正なJSONはデシリアライズできない"""
        # nameが無い
        with self.assertRaises(serializers.ValidationError):
            course_data = self.course_data_set[0]
            course_data.pop('name')
            serializer = CourseSerializer(data=course_data)
            serializer.is_valid(raise_exception=True)
        # パスワードが短すぎる
        with self.assertRaises(serializers.ValidationError):
            course_data = self.course_data_set[0]
            course_data['pin_code'] = '0'
            serializer = CourseSerializer(data=course_data)
            serializer.is_valid(raise_exception=True)
        # パスワードが脆弱
        with self.assertRaises(serializers.ValidationError):
            course_data = self.course_data_set[0]
            course_data['pin_code'] = '1234'
            serializer = CourseSerializer(data=course_data)
            serializer.is_valid(raise_exception=True)

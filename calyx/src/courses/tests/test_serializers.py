import itertools

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import serializers

from courses.models import Course, Year
from courses.serializers import YearSerializer, CourseSerializer, CourseWithoutUserSerializer, CourseStatusSerializer
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
            'users': [],
            'config': self.default_config,
            'is_admin': False
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
            ],
            'config': self.default_config,
            'is_admin': False
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


class CourseStatusSerializerTest(DatasetMixin, TestCase):

    def setUp(self):
        super(CourseStatusSerializerTest, self).setUp()
        self.course_data = self.course_data_set[0]
        self.course = Course.objects.create_course(**self.course_data)
        self.user = User.objects.create_user(**self.user_data_set[0])
        self.course.join(self.user, self.course_data['pin_code'])
        self.labs = self.create_labs(self.course)

    def test_show_gpa(self):
        """GPAの表示の可否"""
        data_set = [4.0, None]
        show_gpa_set = [True, False]
        for gpa, show_gpa in list(itertools.product(data_set, show_gpa_set)):
            with self.subTest(gpa=gpa, show_gpa=show_gpa):
                self.course.config.show_gpa = show_gpa
                self.course.config.show_username = False
                self.course.config.save()
                self.user.gpa = gpa
                self.user.save()
                serializer_context = {'course_pk': self.course.pk}
                serializer = CourseStatusSerializer(instance=self.user, context=serializer_context)
                expected = {
                    'gpa': True if show_gpa is False else gpa is not None,
                    'username': True,
                    'rank_submitted': False
                }
                self.assertEqual(expected, self.to_dict(serializer.data['detail']))

    def test_show_username(self):
        """ユーザ名の表示の可否"""
        data_set = ["hoge", None]
        show_username_set = [True, False]
        for screen_name, show_username in list(itertools.product(data_set, show_username_set)):
            with self.subTest(screen_name=screen_name, show_username=show_username):
                self.course.config.show_username = show_username
                self.course.config.show_gpa = False
                self.course.config.save()
                self.user.screen_name = screen_name
                self.user.save()
                serializer_context = {'course_pk': self.course.pk}
                serializer = CourseStatusSerializer(instance=self.user, context=serializer_context)
                expected = {
                    'username': True if show_username is False else screen_name is not None,
                    'gpa': True,
                    'rank_submitted': False
                }
                self.assertEqual(expected, self.to_dict(serializer.data['detail']))

    def test_rank_submitted(self):
        """提出した希望順位の数の可否"""
        data_set = [3, 1]
        rank_limit_set = [3, 1]
        for submit, limit in list(itertools.product(data_set, rank_limit_set)):
            with self.subTest(submit=submit, limit=limit):
                self.course.config.rank_limit = limit
                self.course.config.save()
                self.user.rank_set.all().delete()
                self.user.save()
                self.submit_ranks(self.labs[:submit], self.user)
                serializer_context = {'course_pk': self.course.pk}
                serializer = CourseStatusSerializer(instance=self.user, context=serializer_context)
                expected = {
                    'username': True,
                    'gpa': True,
                    'rank_submitted': submit == limit
                }
                self.assertEqual(expected, self.to_dict(serializer.data['detail']))

    def test_no_course_joined(self):
        """課程にジョインしていないユーザの場合"""
        self.user.courses.all().delete()
        serializer_context = {'course_pk': self.course.pk}
        serializer = CourseStatusSerializer(instance=self.user, context=serializer_context)
        expected = {
            'status': 'pending',
            'detail': {
                'username': False,
                'gpa': False,
                'rank_submitted': False
            }
        }
        actual = serializer.data
        actual.pop('status_message')
        self.assertEqual(expected, actual)

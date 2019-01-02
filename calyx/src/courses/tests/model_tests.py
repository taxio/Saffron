from copy import deepcopy
from datetime import datetime
from django.db import IntegrityError
from django.test import TestCase
from users.models import User
from courses.models import Course, Year
from .base import user_data_set, course_data_set


class CourseTest(TestCase):

    @classmethod
    def setUpClass(cls):
        super(CourseTest, cls).setUpClass()
        cls.course_data = deepcopy(course_data_set)
        cls.user_data = deepcopy(user_data_set)

    def test_create_course(self):
        """課程を作成する"""
        name = self.course_data[0]['name']
        year_int = self.course_data[0]['year']
        course = Course.objects.create_course(**self.course_data[0])
        year = Year.objects.filter(year=year_int).first()
        self.assertEqual(name, course.name)
        self.assertEqual(year_int, year.year)
        self.assertNotEqual(self.course_data[0]['pin_code'], course.pin_code)

    def test_create_course_without_year(self):
        """明示的にyearを与えずに課程を作成する"""
        year_int = datetime.now().year
        name = self.course_data[1]['name']
        course = Course.objects.create_course(**self.course_data[1])
        year = Year.objects.filter(year=year_int).first()
        self.assertEqual(name, course.name)
        self.assertEqual(year_int, year.year)
        self.assertNotEqual(self.course_data[1]['pin_code'], course.pin_code)

    def test_create_duplicate_course(self):
        """同じ名前の課程を作成する"""
        # 同じ年度
        Course.objects.create_course(**self.course_data[0])
        with self.assertRaises(IntegrityError):
            Course.objects.create_course(**self.course_data[0])
        # 別の年度
        y = 1999
        Course.objects.create_course(**self.course_data[1], year=y)
        Course.objects.create_course(**self.course_data[1])
        self.assertEqual(3, len(Year.objects.all()))

    def test_authenticate(self):
        """課程へ設定されているPINコードで認証する"""
        raw_pin_code = self.course_data[0]['pin_code']
        course = Course.objects.create_course(**self.course_data[0])
        # 異なるパスワードで認証
        self.assertFalse(course.check_password("piyo"))
        # 正しいパスワードで認証
        self.assertTrue(course.check_password(raw_pin_code))

    def test_add_users(self):
        """課程にユーザをジョインさせる"""
        course = Course.objects.create_course(**self.course_data[0])
        raw_pin_code = self.course_data[0]['pin_code']
        users = [User.objects.create_user(**user_data) for user_data in self.user_data]
        for user in users:
            self.assertTrue(course.join(user, raw_pin_code))
        # course = Course.objects.get(course.pk)
        self.assertEqual(len(self.user_data), len(course.users.all()))

    def test_leave_user(self):
        """課程からユーザが抜ける"""
        course = Course.objects.create_course(**self.course_data[0])
        users = [User.objects.create_user(**user_data) for user_data in self.user_data]
        for user in users:
            self.assertTrue(course.join(user, self.course_data[0]['pin_code']))
        for user in users:
            self.assertEqual(None, course.leave(user))
        self.assertEqual(0, len(course.users.all()))

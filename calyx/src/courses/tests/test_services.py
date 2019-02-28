from django.test import TestCase
from .base import DatasetMixin
from courses.services import Summary
from courses.models import Course, User, Lab, Rank


class SummaryTest(DatasetMixin, TestCase):

    def setUp(self):
        super(SummaryTest, self).setUp()
        self.pin_codes = [course_data['pin_code'] for course_data in self.course_data_set]
        self.courses = [Course.objects.create_course(**course_data) for course_data in self.course_data_set]
        self.users = [
            User.objects.create_user(**user_data, gpa=i+1, is_active=True)
            for i, user_data in enumerate(self.user_data_set)
        ]
        self.labs = [
            [Lab.objects.create(**lab, course=course) for lab in self.lab_data_set]
            for course in self.courses
        ]
        for course, pin_code in zip(self.courses, self.pin_codes):
            for user in self.users:
                course.join(user, pin_code)
        for labs in self.labs:
            for user in self.users:
                self.submit_ranks(labs, user)

    def test_summary_gpa(self):
        """志望順位ごとのサマリーを生成する"""
        expected_zero = {'border': 0.0, 'mean': 0.0, 'median': 0.0, 'max': 0.0, 'min': 0.0, 'count': 0}
        expected = {'border': 3.0, 'mean': 2.0, 'median': 2.0, 'max': 3.0, 'min': 1.0, 'count': 3}
        config = {'rank_limit': 3, 'show_gpa': True}
        self.assert_summary(config, expected, expected_zero)

    def test_summary_no_gpa(self):
        """GPAを表示しない場合のサマリーを生成する"""
        expected_zero = {'count': 0}
        expected = {'count': 3}
        config = {'rank_limit': 3, 'show_gpa': False}
        self.assert_summary(config, expected, expected_zero)

    def assert_summary(self, config, expected, expected_zero):
        for course in self.courses:
            labs = course.labs.all()
            for i, lab in enumerate(labs):
                metrics = Summary(lab, config)
                for k in range(len(labs)):
                    with self.subTest(course=course, lab=lab, order=k):
                        if k == i:
                            self.assertEqual(expected, metrics.summarize(k))
                        else:
                            self.assertEqual(expected_zero, metrics.summarize(k))
                with self.subTest(course=course, lab=lab, order=None):
                    self.assertEqual(expected, metrics.summarize_all())

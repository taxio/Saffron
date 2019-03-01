from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from courses.models import Course
from courses.tests.base import DatasetMixin, JWTAuthMixin

User = get_user_model()


class YearViewSetsTest(DatasetMixin, JWTAuthMixin, APITestCase):

    def setUp(self):
        super(YearViewSetsTest, self).setUp()
        self.user = User.objects.create_user(**self.user_data_set[0], is_active=True)
        self._set_credentials()

    def test_list(self):
        courses = list()
        for course_data in self.course_data_set:
            course_data.setdefault('year', 2018)
            courses.append(Course.objects.create_course(**course_data))
        resp = self.client.get('/years/', format='json')
        expected_json = [
            {
                "pk": courses[0].year.pk,
                "year": 2018,
                "courses": [
                    {
                        "pk": course.pk,
                        "name": course.name,
                        "year": 2018,
                        "config": {
                            "show_gpa": course.config.show_gpa,
                            "show_username": course.config.show_username,
                            "rank_limit": course.config.rank_limit
                        }
                    } for course in courses
                ]
            }
        ]
        with self.subTest(logged_in=True, expected=expected_json):
            self.assertEqual(200, resp.status_code)
            self.assertEqual(expected_json, self.to_dict(resp.data))
        # ログインしていなければ見れない
        self._unset_credentials()
        resp = self.client.get('/years/', format='json')
        with self.subTest(logged_in=False, expected=None):
            self.assertEqual(401, resp.status_code)

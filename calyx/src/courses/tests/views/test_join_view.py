from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from courses.models import Course
from courses.tests.base import DatasetMixin, JWTAuthMixin

User = get_user_model()


class JoinViewTest(DatasetMixin, JWTAuthMixin, APITestCase):

    def setUp(self):
        super(JoinViewTest, self).setUp()
        self.user = User.objects.create_user(**self.user_data_set[0], is_active=True)
        self._set_credentials()

    def test_join(self):
        """POST /courses/<pk>/join/"""
        course_data = self.course_data_set[0]
        course = Course.objects.create_course(**course_data)
        payload = {'pin_code': course_data['pin_code']}
        resp = self.client.post(f'/courses/{course.pk}/join/', data=payload, format='json')
        expected = {
            'pk': course.pk,
            'name': course.name,
            'year': course.year.year,
            'users': [
                {
                    "pk": self.user.pk,
                    "username": self.user.username,
                    "is_admin": False
                }
            ],
            'config': self.default_config,
            'is_admin': False
        }
        with self.subTest(status=201, expected=expected):
            self.assertEqual(201, resp.status_code)
            self.assertEqual(expected, self.to_dict(resp.data))
        # 同じユーザの二度目の加入はエラー
        resp = self.client.post(f'/courses/{course.pk}/join/', data=payload, format='json')
        with self.subTest(status=400, expected=None):
            self.assertEqual(400, resp.status_code)

    def test_join_with_invalid_pin_code(self):
        """POST /couses/<pk>/join/"""
        course_data = self.course_data_set[0]
        course = Course.objects.create_course(**course_data)
        # 間違ったPINコードで参加
        payload = {'pin_code': 'invalid_code'}
        resp = self.client.post(f'/courses/{course.pk}/join/', data=payload, format='json')
        with self.subTest(status=400):
            self.assertEqual(400, resp.status_code)
        # 存在しない課程に対してジョイン
        resp = self.client.post('/courses/9999/join/', data=payload, format='json')
        with self.subTest(status=404):
            self.assertEqual(404, resp.status_code)

    def test_join_permission(self):
        """POST /courses/<pk>/join/"""
        course_data = self.course_data_set[0]
        course = Course.objects.create_course(**course_data)
        payload = {'pin_code': course_data['pin_code']}
        # ログインしていなければ参加できない
        self._unset_credentials()
        resp = self.client.post(f'/courses/{course.pk}/join/', data=payload, format='json')
        with self.subTest(status=401):
            self.assertEqual(401, resp.status_code)

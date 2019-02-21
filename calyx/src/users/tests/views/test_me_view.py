from rest_framework import status
from rest_framework.test import APITestCase, URLPatternsTestCase
from django.conf import settings
from django.urls import reverse, path, include

from courses.tests.base import DatasetMixin, JWTAuthMixin
from users.models import User


class TestMeView(DatasetMixin, JWTAuthMixin, APITestCase, URLPatternsTestCase):
    """MeViewのテスト"""

    urlpatterns = [
        path('', include('users.urls.accounts'))
    ]

    def setUp(self):
        super(TestMeView, self).setUp()
        self.users = [User.objects.create_user(**data, is_active=True) for data in self.user_data_set]

    def test_me_get(self):
        """自分自身の情報を取得する"""
        for user in self.users:
            with self.subTest(user=user.username):
                self._set_credentials(user)
                resp = self.client.get(reverse('accounts:me'), format='json')
                self.assertEqual(status.HTTP_200_OK, resp.status_code)
                expected = {
                    'pk': user.pk,
                    'username': user.username,
                    'email': f'{user.username}@{settings.STUDENT_EMAIL_DOMAIN}',
                    'screen_name': user.screen_name,
                    'gpa': user.gpa,
                    'is_admin': False,
                    'joined': False,
                    'courses': []
                }
                self.assertEqual(expected, resp.data)

    def test_me_update(self):
        """自分自身の情報を更新する"""
        gpa = 2.5
        screen_name = 'new name'
        payload = {
            'gpa': gpa,
            'screen_name': screen_name
        }
        for user in self.users:
            with self.subTest(data=payload):
                self._set_credentials(user)
                resp = self.client.patch(reverse('accounts:me'), data=payload, format='json')
                self.assertEqual(status.HTTP_200_OK, resp.status_code)
                expected = {
                    'pk': user.pk,
                    'username': user.username,
                    'email': f'{user.username}@{settings.STUDENT_EMAIL_DOMAIN}',
                    'screen_name': screen_name,
                    'gpa': gpa,
                    'is_admin': False,
                    'joined': False,
                    'courses': []
                }
                self.assertEqual(expected, resp.data)

    def test_me_wrong_information(self):
        """不正な情報で更新する"""
        wrong_gpa = 100
        payload = {
            'gpa': wrong_gpa
        }
        for user in self.users:
            with self.subTest(wrong_data=payload):
                self._set_credentials(user)
                resp = self.client.patch(reverse('accounts:me'), data=payload, format='json')
                self.assertEqual(status.HTTP_400_BAD_REQUEST, resp.status_code)

    def test_me_permission(self):
        """未ログイン状態でリクエスト"""
        resp = self.client.get(reverse('accounts:me'), format='json')
        self.assertEqual(status.HTTP_401_UNAUTHORIZED, resp.status_code)
        payload = {
            'gpa': 2.5,
            'screen_name': 'new name'
        }
        resp = self.client.patch(reverse('accounts:me'), data=payload, format='json')
        self.assertEqual(status.HTTP_401_UNAUTHORIZED, resp.status_code)

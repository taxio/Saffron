from django.urls.conf import path, include
from django.shortcuts import reverse
from rest_framework import status
from rest_framework.test import APITestCase, URLPatternsTestCase

from users.models import User
from courses.tests.base import DatasetMixin, JWTAuthMixin


class TestMeDeleteView(DatasetMixin, JWTAuthMixin, APITestCase, URLPatternsTestCase):
    """UserDeleteViewのテスト"""

    urlpatterns = [
        path('', include('users.urls.accounts'))
    ]

    def setUp(self):
        super(TestMeDeleteView, self).setUp()
        self.users = [User.objects.create_user(**data, is_active=True) for data in self.user_data_set]

    def test_delete_me(self):
        """正しいパスワードを入力して自分自身を削除"""
        for raw_data, user in zip(self.user_data_set, self.users):
            with self.subTest(password=raw_data['password']):
                self._set_credentials(user)
                user_id = user.pk
                payload = {'current_password': raw_data['password']}
                resp = self.client.post(reverse('accounts:me-delete'), data=payload, format='json')
                self.assertEqual(status.HTTP_204_NO_CONTENT, resp.status_code)
                with self.assertRaises(User.DoesNotExist):
                    User.objects.get(pk=user_id)

    def test_wrong_password(self):
        """間違ったパスワードを入力して自分自身を削除"""
        wrong_pass = '1234'
        payload = {'current_password': wrong_pass}
        for raw_data, user in zip(self.user_data_set, self.users):
            with self.subTest(valid_password=raw_data['password'], wrong_password=wrong_pass):
                self._set_credentials(user)
                user_id = user.pk
                resp = self.client.post(reverse('accounts:me-delete'), data=payload, format='json')
                self.assertEqual(status.HTTP_400_BAD_REQUEST, resp.status_code)
                self.assertTrue(User.objects.filter(pk=user_id).exists())

    def test_delete_permission(self):
        """未ログイン状態でリクエスト"""
        self._unset_credentials()
        for raw_data, user in zip(self.user_data_set, self.users):
            with self.subTest():
                user_id = user.pk
                payload = {'current_password': raw_data['password']}
                resp = self.client.post(reverse('accounts:me-delete'), data=payload, format='json')
                self.assertTrue(status.HTTP_401_UNAUTHORIZED, resp.status_code)
                self.assertTrue(User.objects.filter(pk=user_id).exists())

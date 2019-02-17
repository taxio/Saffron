from django.urls import path, include
from django.shortcuts import reverse
from rest_framework import status
from rest_framework.test import APITestCase, URLPatternsTestCase
from users.tests.base import UserDatasetMixin


class PasswordValidationViewTest(UserDatasetMixin, URLPatternsTestCase, APITestCase):

    urlpatterns = [
        path('', include('users.urls.accounts'))
    ]

    def test_valid_password(self):
        """正しいパスワードのチェック"""
        for valid_password in self.valid_passwords:
            payload = {
                'type': 'user',
                'password': valid_password
            }
            expected = {
                'type': 'user',
                'password': 'ok'
            }
            resp = self.client.post(reverse('accounts:password_validate'), data=payload, format='json')
            self.assertEqual(status.HTTP_201_CREATED, resp.status_code)
            self.assertEqual(expected, resp.data)

    def test_invalid_password(self):
        """不正なパスワードのチェック"""
        for invalid_password in self.invalid_passwords:
            payload = {
                'type': 'user',
                'password': invalid_password
            }
            resp = self.client.post(reverse('accounts:password_validate'), data=payload, format='json')
            self.assertEqual(status.HTTP_400_BAD_REQUEST, resp.status_code)
            self.assertTrue('password' in resp.data)

    def test_valid_pin_code(self):
        """正しいPINコードのチェック"""
        for valid_pin_code in self.valid_pin_codes:
            payload = {
                'type': 'pin_code',
                'password': valid_pin_code
            }
            expected = {
                'type': 'pin_code',
                'password': 'ok'
            }
            resp = self.client.post(reverse('accounts:password_validate'), data=payload, format='json')
            self.assertEqual(status.HTTP_201_CREATED, resp.status_code)
            self.assertEqual(expected, resp.data)

    def test_invalid_pin_code(self):
        """不正なPINコードのチェック"""
        for invalid_pin_code in self.invalid_pin_codes:
            payload = {
                'type': 'pin_code',
                'password': invalid_pin_code
            }
            resp = self.client.post(reverse('accounts:password_validate'), data=payload, format='json')
            self.assertEqual(status.HTTP_400_BAD_REQUEST, resp.status_code)
            self.assertTrue('password' in resp.data)

    def test_invalid_types(self):
        """不正なtypeを入力してチェック"""
        invalid_types = ['hoge', 'fuga']
        for invalid_type in invalid_types:
            payload = {
                'type': invalid_type,
                'password': self.valid_passwords[0]
            }
            resp = self.client.post(reverse('accounts:password_validate'), data=payload, format='json')
            self.assertEqual(status.HTTP_400_BAD_REQUEST, resp.status_code)
            self.assertTrue('type' in resp.data)

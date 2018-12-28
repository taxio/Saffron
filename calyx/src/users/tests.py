import re
from urllib.parse import urlparse
from rest_framework import status
from rest_framework.test import APITestCase, URLPatternsTestCase
from rest_framework_jwt.settings import api_settings
from django.urls import reverse, path, include
from django.core import mail
from django.conf import settings

from .models import User


class UserRegistrationTests(APITestCase, URLPatternsTestCase):
    """ユーザ登録周りのテスト"""
    urlpatterns = [
        path('', include('djoser.urls.base'))
    ]

    def setUp(self):
        self.urlregex = re.compile(r'^https?://[\w/:%#$&?()~.=+\-]+$', re.MULTILINE)
        self.expected_mail_subject = 'アカウント有効化 - Saffron'
        self.expect_created_result = {
            'pk': 1,
            'username': 'b0000000',
            'email': 'b0000000@' + settings.STUDENT_EMAIL_DOMAIN,
            'screen_name': 'testuser',
            'gpa': None,
            'is_admin': False,
            'joined': False
        }
        self.user_data = {'username': 'b0000000', 'password': 'testpass', 'screen_name': 'testuser'}
        self.user_email = self.user_data['username'] + '@' + settings.STUDENT_EMAIL_DOMAIN

    def _set_credentials(self, user):
        jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
        jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER
        payload = jwt_payload_handler(user)
        token = jwt_encode_handler(payload)
        self.client.credentials(HTTP_AUTHORIZATION="JWT " + token)

    def test_create_user(self):
        """ユーザ作成プロセスのテスト"""
        resp = self.client.post(reverse('user-create'), data=self.user_data, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data, self.expect_created_result)
        # 登録されたユーザ情報を検証
        users = User.objects.all()
        self.assertEqual(len(users), 1)
        self.assertEqual(users[0].is_active, False)
        self.assertEqual(users[0].is_admin, False)
        self.assertEqual(users[0].email, self.user_email)
        # メールの内容をチェック
        self.assertEqual(mail.outbox[0].subject, self.expected_mail_subject)
        self.assertEqual(len(mail.outbox[0].to), 1)
        self.assertEqual(mail.outbox[0].to[0], self.user_email)
        # メールからアクティベーションURLを抽出して検証
        activation_urls = self.urlregex.findall(mail.outbox[0].body)
        self.assertEqual(len(activation_urls), 1)
        parsed_url = urlparse(activation_urls[0])
        self.assertEqual(parsed_url.scheme, settings.PETALS_PROTOCOL)
        self.assertEqual(parsed_url.netloc, settings.PETALS_DOMAIN)
        # アクティベーションされるか検証
        token = parsed_url.fragment.split('/')[-1]
        uid = parsed_url.fragment.split('/')[-2]
        # 間違った内容を送りつける
        invalid_resp = self.client.post(reverse('user-activate'),
                                        data={'token': 'invalid', 'uid': 'invalid'}, format='json')
        self.assertEqual(invalid_resp.status_code, status.HTTP_400_BAD_REQUEST)
        not_activated_user = User.objects.get(pk=self.expect_created_result['pk'])
        self.assertEqual(not_activated_user.is_active, False)
        # 正しいトークンとuidでアクティベート
        post_resp = self.client.post(reverse('user-activate'), data={'token': token, 'uid': uid}, format='json')
        self.assertEqual(post_resp.status_code, status.HTTP_204_NO_CONTENT)
        activated_user = User.objects.get(pk=self.expect_created_result['pk'])
        self.assertEqual(activated_user.is_active, True)

    def test_duplicate_create_user(self):
        """ユーザを2重で登録するテスト"""
        first_resp = self.client.post(reverse('user-create'), data=self.user_data, format='json')
        self.assertEqual(first_resp.status_code, status.HTTP_201_CREATED)
        second_resp = self.client.post(reverse('user-create'), data=self.user_data, format='json')
        self.assertEqual(second_resp.status_code, status.HTTP_400_BAD_REQUEST)
        users = User.objects.all()
        self.assertEqual(len(users), 1)

    def test_post_invalid_params(self):
        """ユーザ登録に必要ない値などを送るテスト"""
        invalid_resp = self.client.post(reverse('user-create'), data={'hoge': 'fuga'}, format='json')
        self.assertEqual(invalid_resp .status_code, status.HTTP_400_BAD_REQUEST)
        # 無駄なパラメータを一緒にpostした場合
        extra_param_resp = self.client.post(reverse('user-create'),
                                            data=dict(**self.user_data, hoge='fuga'), format='json')
        self.assertEqual(extra_param_resp .status_code, status.HTTP_201_CREATED)

    def test_delete_user(self):
        """ユーザを論理削除するテスト"""
        user = User.objects.create_user(**self.user_data, is_active=True)
        self._set_credentials(user)
        resp = self.client.delete('/users/me/', data=self.user_data)
        self.assertEqual(204, resp.status_code)
        self.assertEqual(True, User.all_objects.get(pk=user.pk).is_deleted)
        # 削除したユーザを再度作成
        before_del_id = user.pk
        user = User.all_objects.create_user(**self.user_data, is_active=True)
        self._set_credentials(user)
        resp = self.client.get('/users/me/')
        self.assertEqual(200, resp.status_code)
        self.assertEqual(before_del_id, resp.data['pk'])

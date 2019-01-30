import re
from urllib.parse import urlparse
from rest_framework import status
from rest_framework.test import APITestCase, URLPatternsTestCase
from django.urls import reverse, path, include
from django.core import mail
from django.conf import settings

from users.models import User
from courses.tests.base import DatasetMixin, JWTAuthMixin


class UserRegistrationTests(DatasetMixin, JWTAuthMixin, APITestCase, URLPatternsTestCase):
    """ユーザ登録周りのテスト"""
    urlpatterns = [
        path('', include('users.urls'))
    ]

    def setUp(self):
        super(UserRegistrationTests, self).setUp()
        self.urlregex = re.compile(r'^https?://[\w/:%#$&?()~.=+\-]+$', re.MULTILINE)
        self.expected_mail_subject = 'アカウント有効化 - Saffron'
        self.user_data = self.user_data_set[0]
        self.user_data.setdefault('screen_name', 'test_user')
        self.expect_created_result = {
            'username': self.user_data['username'],
            'email': f'{self.user_data["username"]}@{settings.STUDENT_EMAIL_DOMAIN}',
            'screen_name': self.user_data['screen_name'],
        }
        self.user_email = self.expect_created_result['email']

    def test_create_user(self):
        """ユーザ作成プロセスのテスト"""
        resp = self.client.post(reverse('accounts:user-create'), data=self.user_data, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data, self.expect_created_result)
        # 登録されたユーザ情報を検証
        users = User.objects.all()
        self.assertEqual(len(users), 1)
        self.assertEqual(users[0].is_active, False)
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
        invalid_resp = self.client.post(reverse('accounts:user-activate'),
                                        data={'token': 'invalid', 'uid': 'invalid'}, format='json')
        self.assertEqual(invalid_resp.status_code, status.HTTP_400_BAD_REQUEST)
        not_activated_user = User.objects.get(username=self.user_data['username'])
        self.assertEqual(not_activated_user.is_active, False)
        # 正しいトークンとuidでアクティベート
        post_resp = self.client.post(reverse('accounts:user-activate'), data={'token': token, 'uid': uid}, format='json')
        self.assertEqual(post_resp.status_code, status.HTTP_204_NO_CONTENT)
        activated_user = User.objects.get(username=self.user_data['username'])
        self.assertEqual(activated_user.is_active, True)

    def test_duplicate_create_user(self):
        """ユーザを2重で登録するテスト"""
        first_resp = self.client.post(reverse('accounts:user-create'), data=self.user_data, format='json')
        self.assertEqual(first_resp.status_code, status.HTTP_201_CREATED)
        second_resp = self.client.post(reverse('accounts:user-create'), data=self.user_data, format='json')
        self.assertEqual(second_resp.status_code, status.HTTP_400_BAD_REQUEST)
        users = User.objects.all()
        self.assertEqual(len(users), 1)

    def test_post_invalid_params(self):
        """ユーザ登録に必要ない値などを送るテスト"""
        invalid_resp = self.client.post(reverse('accounts:user-create'), data={'hoge': 'fuga'}, format='json')
        self.assertEqual(invalid_resp .status_code, status.HTTP_400_BAD_REQUEST)
        # 無駄なパラメータを一緒にpostした場合
        extra_param_resp = self.client.post(reverse('accounts:user-create'),
                                            data=dict(**self.user_data, hoge='fuga'), format='json')
        self.assertEqual(extra_param_resp .status_code, status.HTTP_201_CREATED)

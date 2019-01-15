from django.test import TestCase
from django.conf import settings
from rest_framework import serializers

from courses.tests.base import DatasetMixin
from users.models import User
from users.serializers import UserCreateSerializer


class UserCreateSerializerTest(DatasetMixin, TestCase):

    def test_deserialize(self):
        """Userインスタンスにデシリアライズ"""
        for user_data in self.user_data_set:
            serializer = UserCreateSerializer(data=user_data)
            serializer.is_valid(raise_exception=True)
            instance = serializer.save()
            self.assertEqual(user_data['username'], instance.username)
            self.assertTrue(instance.check_password(user_data['password']))

    def test_deserialize_with_invalid_dataset(self):
        """バリデーションが通らないデータでのデシリアライズ"""
        invalid_dataset = [
            {
                # ユーザ名がおかしい
                'username': 'ユーザ名',
                'password': 'hogefuga',
            },
            {
                # パスワードがおかしい
                'username': 'b1234567',
                'password': 1234
            }
        ]
        for invalid_data in invalid_dataset:
            serializer = UserCreateSerializer(data=invalid_data)
            with self.assertRaises(serializers.ValidationError):
                serializer.is_valid(raise_exception=True)

    def test_serialize(self):
        """JSONにシリアライズ"""
        for user_data in self.user_data_set:
            user = User.objects.create_user(**user_data, is_active=True)
            serializer = UserCreateSerializer(instance=user)
            expected = {
                'username': user_data['username'],
                'email': user_data['username'] + '@' + settings.STUDENT_EMAIL_DOMAIN,
                'screen_name': user_data.get('screen_name', None)
            }
            self.assertEqual(expected, serializer.data)


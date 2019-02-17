from django.test import TestCase
from django.conf import settings
from rest_framework import serializers

from courses.tests.base import DatasetMixin
from users.models import User
from users.serializers import UserCreateSerializer, UserSerializer, PasswordValidationSerializer
from users.tests.base import UserDatasetMixin


class UserCreateSerializerTest(DatasetMixin, TestCase):

    def test_deserialize(self):
        """Userインスタンスにデシリアライズ"""
        for user_data in self.user_data_set:
            serializer = UserCreateSerializer(data=user_data)
            serializer.is_valid(raise_exception=True)
            instance = serializer.save()
            self.assertEqual(user_data['username'], instance.username)
            self.assertEqual(user_data.get('screen_name', None), instance.screen_name)
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


class UserSerializerTest(DatasetMixin, TestCase):

    def test_deserialize_screen_name(self):
        """screen nameの更新"""
        user = User.objects.create_user(**self.user_data_set[0], is_active=True)
        screen_name = '表示名'
        serializer = UserSerializer(instance=user, data={'screen_name': screen_name}, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        self.assertEqual(screen_name, user.screen_name)

    def test_deserialize_gpa(self):
        """GPAの更新"""
        user = User.objects.create_user(**self.user_data_set[0], is_active=True)
        # 正しいGPAでの更新
        valid_gpa_set = [0, 4.0]
        for valid_gpa in valid_gpa_set:
            serializer = UserSerializer(instance=user, data={'gpa': valid_gpa}, partial=True)
            serializer.is_valid(raise_exception=True)
            new_user = serializer.save()
            self.assertEqual(valid_gpa, new_user.gpa)
        # 正しくないGPAでの更新
        invalid_gpa_set = [
            -1.0,  # 負の数
            4.5  # 4.0より大きい数
        ]
        for invalid_gpa in invalid_gpa_set:
            serializer = UserSerializer(instance=user, data={'gpa': invalid_gpa}, partial=True)
            with self.assertRaises(serializers.ValidationError):
                serializer.is_valid(raise_exception=True)

    def test_serialize(self):
        """JSONにシリアライズ"""
        for user_data in self.user_data_set:
            user = User.objects.create_user(**user_data, is_active=True)
            serializer = UserSerializer(instance=user)
            expected = {
                'pk': user.pk,
                'username': user_data['username'],
                'screen_name': user_data.get('screen_name', None),
                'gpa': user_data.get('gpa', None),
                'email': user_data['username'] + '@' + settings.STUDENT_EMAIL_DOMAIN,
                'joined': False,
                'is_admin': False,
                'courses': []
            }
            self.assertEqual(expected, serializer.data)


class PasswordValidationSerializerTest(UserDatasetMixin, TestCase):

    def test_user_valid_password(self):
        type_ = 'user'
        valid_passwords = self.valid_passwords
        for valid_password in valid_passwords:
            data = {
                'type': type_,
                'password': valid_password
            }
            serializer = PasswordValidationSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            expected = {
                'type': type_,
                'password': 'ok'
            }
            self.assertEqual(expected, serializer.data)

    def test_user_invalid_password(self):
        type_ = 'user'
        invalid_passwords = self.invalid_passwords
        for invalid_password in invalid_passwords:
            data = {
                'type': type_,
                'password': invalid_password
            }
            serializer = PasswordValidationSerializer(data=data)
            with self.assertRaises(serializers.ValidationError):
                serializer.is_valid(raise_exception=True)

    def test_pin_code_valid_password(self):
        type_ = 'pin_code'
        valid_passwords = self.valid_pin_codes
        for valid_password in valid_passwords:
            data = {
                'type': type_,
                'password': valid_password
            }
            serializer = PasswordValidationSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            expected = {
                'type': type_,
                'password': 'ok'
            }
            self.assertEqual(expected, serializer.data)

    def test_pin_code_invalid_password(self):
        type_ = 'pin_code'
        invalid_passwords = self.invalid_pin_codes
        for invalid_password in invalid_passwords:
            data = {
                'type': type_,
                'password': invalid_password
            }
            serializer = PasswordValidationSerializer(data=data)
            with self.assertRaises(serializers.ValidationError):
                serializer.is_valid(raise_exception=True)

    def test_invalid_type(self):
        invalid_types = ['hoge', 'poyo']
        password = self.valid_passwords[0]
        for invalid_type in invalid_types:
            data = {
                'type': invalid_type,
                'password': password
            }
            serializer = PasswordValidationSerializer(data=data)
            with self.assertRaises(serializers.ValidationError):
                serializer.is_valid(raise_exception=True)

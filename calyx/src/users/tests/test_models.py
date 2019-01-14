from unicodedata import normalize
from django.test import TestCase
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from courses.tests.base import DatasetMixin
from users.models import User, StudentNumberValidator


class StudentNumberValidatorTest(TestCase):
    """学籍番号のバリデータのテスト"""

    def setUp(self):
        super(StudentNumberValidatorTest, self).setUp()
        self.validator = StudentNumberValidator()

    def test_valid_id(self):
        """正しい学籍番号のテスト"""
        valid_id_set = [
            'b0000000',  # 学部
            'm0000000',  # 修士
            'd0000000',  # 博士
        ]
        for valid_id in valid_id_set:
            self.assertEqual(None, self.validator(valid_id))

    def test_invalid_id(self):
        """誤った学籍番号のテスト"""
        invalid_id_set = [
            'b123456',  # 短すぎる
            'b12345678',  # 長すぎる
            'a1234567',  # プレフィクスが違う
        ]
        for invalid_id in invalid_id_set:
            with self.assertRaises(ValidationError):
                self.validator(invalid_id)


class UserModelTest(DatasetMixin, TestCase):
    """ユーザモデルのテスト"""

    def test_create_user(self):
        """ユーザを作成する"""
        for user_data in self.user_data_set:
            user = User.objects.create_user(**user_data)
            self.assertEqual(normalize('NFKC', user_data['username']), user.username)
            self.assertEqual(user_data.get('screen_name', None), user.screen_name)
            self.assertFalse(user.is_active)
            self.assertFalse(user.is_staff)
            self.assertFalse(user.is_superuser)
            self.assertTrue(user.check_password(user_data['password']))
        # 同一ユーザ名は重複登録できない
        for user_data in self.user_data_set:
            with transaction.atomic():
                with self.assertRaises(IntegrityError):
                    User.objects.create_user(**user_data)

    def test_update_username(self):
        """作成したユーザのユーザ名を変更する"""
        user_id_set = list()
        for user_data in self.user_data_set:
            user = User.objects.create_user(**user_data)
            user_id_set.append(user.pk)
        new_id_set = list()
        for i, user_id in enumerate(user_id_set):
            new_id = f'b123456{i}'
            User.objects.filter(pk=user_id).update(username=new_id)
            new_id_set.append(new_id)
        for user_id, new_id in zip(user_id_set, new_id_set):
            user = User.objects.get(pk=user_id)
            self.assertEqual(user.username, new_id)

    def test_update_gpa(self):
        """GPAを更新する"""
        user = User.objects.create_user(**self.user_data_set[0])
        # 最初はNULL
        self.assertEqual(None, user.gpa)
        # 正しいGPAで更新する
        valid_gpa_set = [
            0,  # 整数も許容する
            4.0,
        ]
        for valid_gpa in valid_gpa_set:
            user.gpa = valid_gpa
            user.save()
            self.assertEqual(valid_gpa, user.gpa)

    def test_update_password(self):
        """パスワードを更新する"""
        user = User.objects.create_user(**self.user_data_set[0])
        valid_password = 'hogefugapiyo'
        user.set_password(valid_password)
        user.save()
        self.assertTrue(user.check_password(valid_password))

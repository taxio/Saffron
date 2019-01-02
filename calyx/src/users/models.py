from typing import TYPE_CHECKING
from django.db import models, transaction
from django.db.utils import IntegrityError
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.contrib.auth.validators import ASCIIUsernameValidator
from django.conf import settings
from django.utils import timezone

if TYPE_CHECKING:
    from courses.models import Course


class StudentNumberValidator(ASCIIUsernameValidator):
    regex = r'^[bmd]\d{7}$'
    message = 'Enter a valid student number. For example, b1234567 or m7654321.'


class SoftDeletionQuerySet(models.QuerySet):

    def delete(self):
        """削除日と削除フラグをアップデートするのみ"""
        # TODO: 志望研究室も消す
        return super(SoftDeletionQuerySet, self).update(
            deleted_at=timezone.now(),
            gpa=None,
            is_deleted=True
        )

    def hard_delete(self):
        """DBからレコード自体を削除"""
        return super(SoftDeletionQuerySet, self).delete()

    def alive_only(self):
        """論理削除されていないユーザのみを返す"""
        return self.filter(is_deleted=False)

    def dead_only(self):
        """削除済みユーザのみを返す"""
        return self.filter(is_deleted=True)


class UserManager(BaseUserManager):
    """
    カスタムユーザモデルのためのマネージャ
    """
    def __init__(self, alive_only: bool = True, *args, **kwargs):
        self.alive_only = alive_only
        super(UserManager, self).__init__(*args, **kwargs)

    def create_user(self, username, password, **extra_fields):
        """
        ユーザ作成の関数
        :param username: 学生ID b0000000 *必須*
        :param password: パスワード
        :param extra_fields: その他のパラメータ
        :return: 作成されたStudentのインスタンス
        """
        if not username:
            return ValueError('Student number is required')
        try:
            with transaction.atomic():
                student = self.model(
                    username=username,
                    email=username + '@' + settings.STUDENT_EMAIL_DOMAIN,  # メールアドレスを動的に生成
                    **extra_fields
                )
                student.set_password(password)
                student.save(using=self.db)
        except IntegrityError:
            with transaction.atomic():
                # 論理削除したユーザを復活
                student = self.get(username=username)
                student.set_password(password)
                student.is_deleted = False
                student.deleted_at = None
                student.save(using=self.db)
        return student

    def create_superuser(self, username, password, **kwargs):
        """
        /adminにログインできるスーパーユーザ作成用の関数
        :param username: 学生ID *必須*
        :param password: パスワード
        :return: 作成されたStudentのインスタンス
        """
        return self.create_user(username=username, password=password, is_staff=True,
                                is_superuser=True, is_active=True, **kwargs)

    def get_queryset(self):
        """alive_only=True（デフォルト）のとき，削除していないユーザのみを返す"""
        if self.alive_only:
            return SoftDeletionQuerySet(self.model).alive_only()
        return SoftDeletionQuerySet(self.model)


class User(AbstractBaseUser, PermissionsMixin):
    """
    学生のモデル
    """
    # ユーザ名をバリデーション
    username_validator = StudentNumberValidator()

    username = models.CharField(max_length=64, unique=True, verbose_name='学生ID',
                                help_text='小文字の英数字および数字のみ使用できます',
                                validators=[username_validator])
    email = models.EmailField(max_length=255, unique=True, default='')
    is_active = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField('登録日時', auto_now_add=True)
    modified_at = models.DateTimeField('更新日時', auto_now=True)

    screen_name = models.CharField(max_length=255, null=True, blank=True, verbose_name='氏名')
    gpa = models.FloatField(verbose_name='GPA', blank=True, null=True)

    # 課程ごとのAdminかどうか
    is_admin = models.BooleanField(default=False)

    # 課程に正しいPINコードを入力して参加したかどうかのフラグ
    joined = models.BooleanField(default=False)

    # ユーザの論理削除フラグ
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField('削除日時', blank=True, null=True)

    # ユーザ名のフィールドを学生IDに設定
    USERNAME_FIELD = 'username'

    objects = UserManager()
    # 論理削除済みユーザも取得する場合
    all_objects = UserManager(alive_only=False)

    def __str__(self):
        """学生IDを返却"""
        return self.username

    class Meta:
        ordering = ['username']
        verbose_name = '学生'
        verbose_name_plural = '学生'

    def delete(self, *args, **kwargs):
        """
        ユーザを論理削除する関数
        :return:
        """
        self.is_deleted = True
        self.deleted_at = timezone.now()
        # TODO: 志望研究室も消す
        self.gpa = None
        self.save()

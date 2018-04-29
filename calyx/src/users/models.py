from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.conf import settings
from courses.models import Course


class UserManager(BaseUserManager):
    """
    カスタムユーザモデルのためのマネージャ
    """

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
        student = self.model(
            username=username,
            email=username + '@' + settings.STUDENT_EMAIL_DOMAIN,  # メールアドレスを動的に生成
            **extra_fields
        )
        student.set_password(password)
        student.save(using=self.db)
        return student

    def create_superuser(self, student_number, password):
        """
        /adminにログインできるスーパーユーザ作成用の関数
        :param student_number: 学生ID *必須*
        :param password: パスワード
        :return: 作成されたStudentのインスタンス
        """
        return self.create_user(student_number=student_number, password=password, is_staff=True, is_superuser=True)


class User(AbstractBaseUser, PermissionsMixin):
    """
    学生のモデル
    """
    username = models.CharField(max_length=64, unique=True, verbose_name='学生ID',
                                help_text='小文字の英数字および数字のみ使用できます')
    email = models.EmailField(max_length=255, unique=True, default='')
    is_active = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    created_date = models.DateTimeField('登録日時', auto_now_add=True)
    modified_date = models.DateTimeField('更新日時', auto_now=True)

    screen_name = models.CharField(max_length=255, null=True, blank=True, verbose_name='氏名')
    gpa = models.FloatField(verbose_name='GPA', blank=True, null=True)
    # 荒らしに備え，課程の情報を削除してリセットできるようにする
    # models.SET_NULLはリレーション先が削除されたときこのカラムにnullをセットする
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, blank=True, null=True, verbose_name='課程')

    # 課程ごとのAdminかどうか
    is_admin = models.BooleanField(default=False)

    # ユーザ名のフィールドを学生IDに設定
    USERNAME_FIELD = 'username'

    objects = UserManager()

    def __str__(self):
        """学生IDを返却"""
        return self.username

    class Meta:
        ordering = ['username']
        verbose_name = '学生'
        verbose_name_plural = '学生'

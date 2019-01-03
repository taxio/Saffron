import unicodedata

from typing import TYPE_CHECKING
from django.contrib.auth.models import Group
from django.db import models, transaction
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth import get_user_model
from django.dispatch import receiver
from django.utils import timezone
from .errors import AlreadyJoinedError, NotJoinedError, NotAdminError

if TYPE_CHECKING:
    from typing import Optional
    from users.models import User as AppUser

User = get_user_model()  # type: AppUser


def create_group_name(year: int, course_name: str) -> str:
    """管理グループの名称を返す"""
    return f'{year}_{course_name}'


class Year(models.Model):
    """
    年度のモデル
    """

    year = models.IntegerField('年度', unique=True)

    class Meta:
        ordering = ['year']
        verbose_name = '年度'
        verbose_name_plural = '年度'

    def __str__(self):
        return str(self.year)


class CourseManager(models.Manager):
    """
    課程を操作するマネージャ
    """

    def create_course(self, name: str, pin_code: str, year: 'Optional[int]' = None) -> 'Course':
        """
        新しい課程を作成する．
        :param name: 課程の名前
        :param pin_code: 課程に設定するPINコード
        :param year: 値を渡さなければ現在の年をデフォルトで使用する
        :return: Course
        """
        with transaction.atomic():
            model = self.model  # type: Course
            name = model.normalize_name(name)
            if year is None:
                year = timezone.now().year
            group_name = create_group_name(year, name)
            admin_user_group, _ = Group.objects.get_or_create(name=group_name)
            year_obj, _ = Year.objects.get_or_create(year=year)
            course = model(name=name, year=year_obj, admin_user_group=admin_user_group)
            course.set_password(pin_code)
            course.save()
        return course


class Course(models.Model):
    """
    課程や学部のモデル
    """

    name = models.CharField('名称', max_length=255)
    pin_code = models.CharField('PINコード', max_length=255)
    year = models.ForeignKey(Year, on_delete=models.CASCADE, related_name='courses')
    users = models.ManyToManyField(User, verbose_name="所属学生", blank=True, related_name='courses')
    admin_user_group = models.OneToOneField(Group, on_delete=models.CASCADE, blank=True, null=True,
                                            related_name='course', unique=True)

    _pin_code = None

    objects = CourseManager()

    class Meta:
        # 課程の名称と年度でユニーク制約を張る
        unique_together = ('name', 'year')
        ordering = ['name', '-year__year']
        verbose_name = '課程'
        verbose_name_plural = '課程'

    def __str__(self):
        return '{n}（{y}）'.format(y=str(self.year.year), n=self.name)

    def set_password(self, raw_password: str):
        """
        パスワードをハッシュ化してセットする
        :param raw_password: パスワード文字列
        :return: None
        """
        self._pin_code = raw_password
        self.pin_code = make_password(raw_password)

    def check_password(self, raw_pin_code: str) -> bool:
        """
        与えられたPINコードが正しいならばTrueを返す
        :return:
        """
        def setter(raw_password):
            """Passwordのハッシュアルゴリズムが変わった場合にパスワードを更新する"""
            self.set_password(raw_password)
            self._password = None
            self.save(update_fields=["password"])
        return check_password(raw_pin_code, self.pin_code, setter)

    @classmethod
    def normalize_name(cls, name: str) -> str:
        return unicodedata.normalize('NFKC', name)

    def join(self, user: User, password: str) -> bool:
        """
        課程へジョインする．既にジョインしていればAlreadyJoinedErrorをraiseする．
        :param user: ジョインするユーザ
        :param password: 課程ごとに設定されているPINコード
        :return: bool
        """
        if user.joined:
            raise AlreadyJoinedError(self)
        if self.check_password(password):
            self.users.add(user)
            self.save()
            user.joined = True
            user.save()
            return True
        return False

    def leave(self, user: User) -> None:
        """
        課程から脱退する．参加している課程が無い場合はNotJoinedErrorをraiseする．
        :return:
        """
        if user.joined and self.users.filter(pk=user.pk).exists():
            self.users.remove(user)
            self.save()
            user.joined = False
            user.save()
            return None
        raise NotJoinedError(self)

    def register_as_admin(self, user: 'AppUser') -> None:
        """
        指定されたユーザをこの課程の管理者として登録する．この課程に参加していない場合，NotJoinedErrorをraiseする．
        :param user: 管理者として登録したいユーザ
        :return:
        """
        if not self.users.filter(id=user.pk).exists():
            raise NotJoinedError(self)
        if not user.groups.filter(name=self.admin_group_name).exists():
            user.groups.add(self.admin_user_group)

    def unregister_from_admin(self, user: 'AppUser') -> None:
        """
        指定されたユーザを管理者から外す．そのユーザが管理者でなかった場合，NotAdminErrorをraiseする．
        :param user: 管理者から外したいユーザ
        :return:
        """
        if not user.groups.filter(name=self.admin_group_name).exists():
            raise NotAdminError(self, user)
        user.groups.remove(self.admin_user_group)

    @property
    def admin_group_name(self) -> str:
        """管理ユーザグループの名称"""
        return create_group_name(self.year.year, self.name)


@receiver(models.signals.post_save, sender=Course)
def change_admin_group_name(sender, instance: 'Course', **kwargs):
    """
    課程の名称が変わったときに自動でグループの名称を変える
    :param sender: Modelクラス
    :param instance: そのインスタンス
    :param kwargs:
    :return:
    """
    if instance.admin_user_group is None:
        return
    if instance.admin_user_group.name == instance.admin_group_name:
        return
    group = Group.objects.get(pk=instance.admin_user_group.pk)
    group.name = instance.admin_group_name
    group.save()
    return

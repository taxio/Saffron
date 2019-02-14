import unicodedata

from typing import TYPE_CHECKING
from django.contrib.auth.models import Group
from django.core.cache import cache
from django.db import models, transaction, IntegrityError
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

    def create_course(self, name: str, pin_code: str, year: 'Optional[int]' = None,
                      config: 'Optional[dict]'=None) -> 'Course':
        """
        新しい課程を作成する．
        :param name: 課程の名前
        :param pin_code: 課程に設定するPINコード
        :param year: 値を渡さなければ現在の年をデフォルトで使用する
        :param config: 設定のディクショナリ
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
            # Configが一緒にPOSTされた場合，デフォルトのconfigをオーバーライド
            if config is not None:
                for key, val in config.items():
                    setattr(course.config, key, val)
                course.config.save()
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
        if user.courses.filter(pk=self.pk).exists():
            raise AlreadyJoinedError(self)
        if self.check_password(password):
            self.users.add(user)
            self.save()
            return True
        return False

    def leave(self, user: User) -> None:
        """
        課程から脱退する．参加している課程が無い場合はNotJoinedErrorをraiseする．
        :return:
        """
        if not self.users.filter(pk=user.pk).exists():
            raise NotJoinedError(self)
        self.users.remove(user)
        self.save()
        return None

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
            user.save()

    def unregister_from_admin(self, user: 'AppUser') -> None:
        """
        指定されたユーザを管理者から外す．そのユーザが管理者でなかった場合，NotAdminErrorをraiseする．
        :param user: 管理者から外したいユーザ
        :return:
        """
        if not user.groups.filter(name=self.admin_group_name).exists():
            raise NotAdminError(self, user)
        user.groups.remove(self.admin_user_group)
        user.save()

    @property
    def admin_group_name(self) -> str:
        """管理ユーザグループの名称"""
        return create_group_name(self.year.year, self.name)


class Config(models.Model):
    """希望調査の表示設定"""

    show_gpa = models.BooleanField('GAPを表示する', default=False)
    show_username = models.BooleanField('ユーザ名を表示する', default=False)
    rank_limit = models.IntegerField('表示する志望順位の数', default=3)
    course = models.OneToOneField(Course, verbose_name="課程", related_name="config", on_delete=models.CASCADE)

    class Meta:
        verbose_name = "表示設定"
        verbose_name_plural = "表示設定"

    def __str__(self):
        return f'{self.course.name}の表示設定'


class Lab(models.Model):
    """研究室のモデル"""

    name = models.CharField("研究室名", max_length=255)
    capacity = models.IntegerField("許容人数", default=0)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='labs')

    class Meta:
        verbose_name = "研究室"
        verbose_name_plural = "研究室"
        # ある課程について同名の研究室は許容しない
        unique_together = ["name", "course"]

    def __str__(self):
        return f'{self.course} - {self.name}'


class RankManager(models.Manager):
    """研究室志望順位を操作するマネージャー"""

    def create(self, lab, course, user, order):
        if self.filter(course=course, user=user, lab=lab).exists():
            # 既にその研究室の志望順位を登録している場合
            raise IntegrityError
        return super(RankManager, self).create(lab=lab, course=course, user=user, order=order)


class Rank(models.Model):
    """研究室志望順位のモデル"""

    # 削除時に自動で志望順位を入れ替えるため．on_deleteにはDO_NOTHINGを指定する
    # SET_NULL等をすると入れ替えた後にNoneが代入されてしまう
    lab = models.ForeignKey(Lab, verbose_name='研究室', on_delete=models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(User, verbose_name='ユーザ', on_delete=models.CASCADE)
    course = models.ForeignKey(Course,verbose_name='課程', on_delete=models.CASCADE)
    order = models.IntegerField("志望順位")

    objects = RankManager()

    class Meta:
        verbose_name = "志望順位"
        verbose_name_plural = "志望順位"
        unique_together = ["user", "order", "course"]

    def __str__(self):
        return f'{self.user}-{self.order}-{self.lab}'


@receiver(models.signals.post_save, sender=Course)
def change_admin_group_name(sender, instance: 'Course', **kwargs):
    """
    課程の名称が変わったときに自動でグループの名称を変える
    :param sender: Modelクラス
    :param instance: そのインスタンス
    :param kwargs:
    :return:
    """
    if not Config.objects.filter(course=instance).exists():
        Config.objects.create(course=instance)
    if instance.admin_user_group is None:
        return
    if instance.admin_user_group.name == instance.admin_group_name:
        return
    group = Group.objects.get(pk=instance.admin_user_group.pk)
    group.name = instance.admin_group_name
    group.save()
    return


@receiver(models.signals.pre_delete, sender=Lab)
def move_up_ranks(sender, instance: 'Lab', **kwargs):
    """
    研究室が削除されたときに自動で志望順位を繰り上げる
    :param sender: Modelクラス
    :param instance: そのインスタンス
    :param kwargs:
    :return:
    """
    ranks = Rank.objects.filter(lab=instance).all()
    users = [rank.user for rank in ranks]
    for rank_to_del, user in zip(ranks, users):
        rank_filter = {'course': rank_to_del.course, 'order__gt': rank_to_del.order, 'user': user}
        for rank in Rank.objects.filter(**rank_filter).order_by('order').all():
            # 消す対象より下の志望順位の研究室を順に繰り上げる
            rank_to_del.lab_id = rank.lab_id
            rank_to_del.save()
            rank_to_del = rank
        # 最後の志望の研究室はNULLにする
        rank_to_del.lab = None
        rank_to_del.save()


def make_config_cache(instance: 'Config') -> 'dict':
    return {
        'show_gpa': instance.show_gpa,
        'show_username': instance.show_username,
        'rank_limit': instance.rank_limit,
    }


def set_config_from_instance(instance: 'Config') -> dict:
    config_dict = make_config_cache(instance)
    cache_key = f"course-config-{instance.course_id}"
    cache.set(cache_key, config_dict)
    return config_dict


def get_config_cache(course_pk: 'int') -> dict:
    cache_key = f"course-config-{course_pk}"
    cached_config = cache.get(cache_key, None)
    if cached_config is None:
        config = Config.objects.filter(course_id=course_pk).first()
        cached_config = set_config_from_instance(config)
    return cached_config


@receiver(models.signals.post_save, sender=Config)
def set_config_cache(sender, instance: 'Config', **kwargs):
    """
    設定が更新されたときにキャッシュも更新する
    :param sender: Modelクラス
    :param instance: 設定のインスタンス
    :param kwargs:
    :return:
    """
    set_config_from_instance(instance)

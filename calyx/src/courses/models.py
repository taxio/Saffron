import unicodedata

from typing import TYPE_CHECKING
from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth import get_user_model
from django.utils import timezone
from .errors import AlreadyJoinedError, NotJoinedError

if TYPE_CHECKING:
    from typing import Optional

User = get_user_model()


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
        model = self.model  # type: Course
        name = model.normalize_name(name)
        if year is None:
            year = timezone.now().year
        year_obj, _ = Year.objects.get_or_create(year=year)
        course = model(name=name, year=year_obj)
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
            raise AlreadyJoinedError(course=self, user=user)
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
        raise NotJoinedError(user)

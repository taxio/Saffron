from django.db import models
from django.contrib.auth.hashers import make_password


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


class Course(models.Model):
    """
    課程や学部のモデル
    """

    name = models.CharField('名称', max_length=255)
    pin_code = models.CharField('PINコード', max_length=255)
    year = models.ForeignKey(Year, on_delete=models.CASCADE, related_name='courses')

    class Meta:
        # 課程の名称と年度でユニーク制約を張る
        unique_together = ('name', 'year')
        ordering = ['name', '-year__year']
        verbose_name = '課程'
        verbose_name_plural = '課程'

    def __str__(self):
        return '{n}（{y}）'.format(y=str(self.year.year), n=self.name)

    def set_password(self, password: str):
        """
        パスワードをハッシュ化してセットする
        :param password: パスワード文字列
        :return: None
        """
        self.pin_code = make_password(password)

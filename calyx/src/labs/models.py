from django.db import models
from courses.models import Course
from users.models import User


class Lab(models.Model):
    """
    研究室のモデル
    """
    name = models.CharField('研究室名', max_length=255)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, verbose_name='課程', related_name='labs')
    capacity = models.IntegerField('定員', default=0)

    class Meta:
        # 研究室名と課程でユニーク制約を張る
        ordering = ['name', '-course__year__year']
        unique_together = ('name', 'course')

    def __str__(self):
        return '{n} - {c}'.format(n=self.name, c=self.course)


class Rank(models.Model):
    """
    研究室志望のモデル
    """
    order = models.IntegerField('志望順位', default=1)
    lab = models.ForeignKey(Lab, on_delete=models.CASCADE, verbose_name='研究室')
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='学生', related_name='ranks')

    class Meta:
        ordering = ['order']
        # ユーザと研究室でユニーク制約を張る
        # 志望順位まで含めると順位の変更をするのが非常に面倒になるため
        unique_together = ('lab', 'user')

    def __str__(self):
        return '{o} - {u}'.format(o=self.order, u=self.user)

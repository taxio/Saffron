from django.db import models


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

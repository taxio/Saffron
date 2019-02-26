from typing import TYPE_CHECKING

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db import models
from django.dispatch import receiver

from courses.models import Course, Config, Rank, Lab
from courses.services import set_config_from_instance, update_summary_cache

if TYPE_CHECKING:
    from users.models import User as AppUser

User = get_user_model()  # type: AppUser


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


@receiver(models.signals.post_save, sender=Lab)
def update_rank_summary_when_capacity_changed(sender, instance: 'Lab', **kwargs):
    update_fields = kwargs.get("update_fields", None)
    if update_fields is not None and "capacity" in update_fields:
        update_summary_cache(instance.course)


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
    update_summary_cache(instance.course)


@receiver(models.signals.post_save, sender=User)
def update_rank_summary_based_on_user_attr(sender, instance: 'AppUser', **kwargs):
    created = kwargs.get('created', False)
    if not created:
        update_fields = kwargs.get('update_fields', None)
        if update_fields is not None and 'gpa' in update_fields:
            courses = instance.courses.all()
            for course in courses:
                update_summary_cache(course)

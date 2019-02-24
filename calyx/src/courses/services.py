from typing import TYPE_CHECKING
from itertools import chain
from statistics import mean, median

from django.contrib.auth import get_user_model
from django.core.cache import cache

from courses.models import Config, Course, Lab

if TYPE_CHECKING:
    from typing import List, Dict
    from users.models import User as AppUser

User = get_user_model()  # type: AppUser


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


class Summary(object):

    def __init__(self, lab: 'Lab', config: 'dict'):
        self.lab = lab
        self.rank_limit = config.get('rank_limit')
        self.show_gpa = config.get('show_gpa')
        self.gpa_set_all = dict()

    def _make_summary(self, gpa_set: 'List[float]') -> 'Dict[str, int]':
        summary = dict()
        if self.show_gpa:
            # GPAの降順でソート
            sorted(gpa_set, reverse=True)
            # ボーダーラインの算出
            if len(gpa_set) < self.rank_limit:
                summary['border'] = gpa_set[-1] if len(gpa_set) > 0 else 0.0
            else:
                summary['border'] = gpa_set[self.rank_limit-1]
            # 平均値，中央値，最大値，最小値
            if len(gpa_set) > 0:
                summary['mean'] = mean(gpa_set)
                summary['median'] = median(gpa_set)
                summary['max'] = max(gpa_set)
                summary['min'] = min(gpa_set)
            else:
                summary['mean'], summary['median'], summary['max'], summary['min'] = 0.0, 0.0, 0.0, 0.0
        # 志望人数
        summary['count'] = len(gpa_set)
        return summary

    def _get_gpa_set(self, order: int) -> 'List[int]':
        rank_set = self.lab.rank_set.filter(order=order).select_related('user').all()
        gpa_set = [rank.user.gpa for rank in rank_set]
        # GPA未入力のユーザを省く
        if self.show_gpa:
            gpa_set = [gpa for gpa in gpa_set if gpa is not None]
        return gpa_set

    def summarize(self, order: int) -> 'Dict[str, int]':
        """志望順位を指定してサマライズする"""
        gpa_set = self._get_gpa_set(order)
        if order not in self.gpa_set_all.keys():
            self.gpa_set_all[order] = gpa_set
        return self._make_summary(gpa_set)

    def summarize_all(self) -> dict:
        """志望者全員のGPAからサマリーを生成する"""
        exists_keys = self.gpa_set_all.keys()
        if len(exists_keys) != self.rank_limit:
            for i in range(self.rank_limit):
                if i not in exists_keys:
                    self.gpa_set_all[i] = self._get_gpa_set(i)
        gpa_array = chain.from_iterable(self.gpa_set_all.values())
        return self._make_summary(list(gpa_array))


def make_summary_cache(instance: 'Course') -> 'List[dict]':
    """配属希望調査のサマリーをCourseのインスタンスから生成する"""
    config = get_config_cache(instance.pk)
    summary = []
    for lab in instance.labs.all():
        summary_per_lab = {
            'pk': lab.pk,
            'name': lab.name,
            'capacity': lab.capacity,
            'detail': list()
        }
        gpa_metrics = Summary(lab, config)
        # 志望順位ごとのサマリーを作成
        for i in range(config.get('rank_limit')):
            summary_per_lab['detail'].append(gpa_metrics.summarize(i))
        # 順位関係なく全体のサマリーを作成
        summary_per_lab['abstract'] = gpa_metrics.summarize_all()
        summary.append(summary_per_lab)
    return summary


def get_summary(course: 'Course'):
    """課程ごとの希望調査のサマリーを取得する"""
    cache_key = f"course-summary-{course.pk}"
    cached_summary = cache.get(cache_key, None)
    if cached_summary is None:
        cached_summary = make_summary_cache(course)
        cache.set(cache_key, cached_summary)
    return cached_summary

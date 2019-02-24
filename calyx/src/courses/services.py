from typing import TYPE_CHECKING

from django.contrib.auth import get_user_model
from django.core.cache import cache

from courses.models import Config

if TYPE_CHECKING:
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

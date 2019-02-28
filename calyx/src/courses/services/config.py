from django.core.cache import cache

from courses.models import Config


def make_config_cache(instance: 'Config') -> 'dict':
    """Configをシリアライズしてキャッシュ用のディクショナリを生成する"""
    return {
        'show_gpa': instance.show_gpa,
        'show_username': instance.show_username,
        'rank_limit': instance.rank_limit,
    }


def set_config_from_instance(instance: 'Config') -> dict:
    """Configインスタンスを受け取ってcacheに格納する"""
    config_dict = make_config_cache(instance)
    cache_key = f"course-config-{instance.course_id}"
    cache.set(cache_key, config_dict)
    return config_dict


def get_config_cache(course_pk: 'int') -> dict:
    """Cacheからコンフィグを取得する．存在しない場合，新たにキャッシュを生成して格納後，コンフィグを返す．"""
    cache_key = f"course-config-{course_pk}"
    cached_config = cache.get(cache_key, None)
    if cached_config is None:
        config = Config.objects.filter(course_id=course_pk).first()
        cached_config = set_config_from_instance(config)
    return cached_config



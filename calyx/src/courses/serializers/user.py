from django.contrib.auth import get_user_model
from rest_framework import serializers

from courses.services import get_config_cache

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    ユーザオブジェクトのシリアライザ
    """

    # NestedViewMixinで使用される親要素のフィルタリング．
    # dirty hackっぽいが，Course一覧からプライマリキーでフィルタをかけて1つに絞り，参加するユーザ一覧を取得する
    # `course_pk`がURLパラメータのキー，`pk`が絞り込みに使用するキー
    parent_lookup_kwargs = {
        'course_pk': 'pk'
    }

    class Meta:
        model = User
        fields = ("pk", "username", "email", "screen_name", "gpa")
        extra_kwargs = {
            "username": {"read_only": True},
            "email": {"read_only": True},
            "screen_name": {"read_only": True},
            "gpa": {"read_only": True}
        }

    def _rm_from_represent(self, represent: dict, config_cache: dict, cache_key: str, to_del: str) -> dict:
        """課程の設定のキーと削除対象のキーを受取って存在すれば削除"""
        if not config_cache.get(cache_key, True):
            if to_del in represent:
                represent.pop(to_del)
        return represent

    def to_representation(self, instance):
        """課程の設定に応じて返すパラメータを決定する"""
        represent = super(UserSerializer, self).to_representation(instance)
        course = self.context.get('course', None)
        if course:
            config = get_config_cache(course.pk)
            represent = self._rm_from_represent(represent, config, 'show_gpa', 'gpa')
            represent = self._rm_from_represent(represent, config, 'show_username', 'screen_name')
        return represent

from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

from courses.models import Course, Config, Lab, Rank
from courses.services import get_config_cache
from .user import UserSerializer

User = get_user_model()


class RankListSerializer(serializers.ListSerializer):
    """希望順位をまとめて作成/更新するシリアライザ"""

    def validate(self, attrs):
        config = self.context['course'].config  # type: Config
        if len(attrs) != config.rank_limit:
            raise serializers.ValidationError(
                {'non_field_errors': f'希望順位の提出数は{config.rank_limit}個である必要があります．'}
            )
        labs = [attr['lab'] for attr in attrs]
        if len(labs) != len(list(set(labs))):
            return serializers.ValidationError(
                {'non_field_errors': '同じ研究室を複数指定することはできません．'}
            )
        return super(RankListSerializer, self).validate(attrs)

    def create(self, validated_data):
        user = self.context['request'].user  # type: User
        course = self.context['course']  # type: Course
        rank_list = []
        with transaction.atomic():
            for i, data in enumerate(validated_data):
                rank, _ = Rank.objects.update_or_create(
                    user=user, course=course, order=i, defaults={'lab': data['lab']}
                )
                rank_list.append(rank)
        return rank_list


class RankSerializer(serializers.ModelSerializer):
    """希望順位を作成するシリアライザ"""
    lab = serializers.PrimaryKeyRelatedField(
        queryset=Lab.objects.select_related('course').all(),
        error_messages={'does_not_exist': "指定された研究室は見つかりませんでした．"},
    )

    class Meta:
        model = Rank
        fields = ('lab',)
        list_serializer_class = RankListSerializer


class RankPerLabListSerializer(serializers.ListSerializer):
    """研究室ごとの希望順位を表示するシリアライザ"""

    def to_representation(self, data):
        """
        [[第1志望のユーザのリスト],[第2志望のユーザのリスト],...]
        :param data:
        :return:
        """
        course = self.context['course']
        config = get_config_cache(course.pk)
        rank_per_order = list()
        for order in range(config["rank_limit"]):
            rank_per_order.append(
                [self.child.to_representation(rank) for rank in data.filter(order=order).all()]
            )
        return rank_per_order


class RankPerLabSerializer(serializers.ModelSerializer):
    """
    希望順位のシリアライザ
    """

    user = UserSerializer(read_only=True)

    parent_lookup_kwargs = {
        'lab_pk': 'lab_id'
    }

    class Meta:
        model = Rank
        fields = ('user',)
        list_serializer_class = RankPerLabListSerializer

    def to_representation(self, instance):
        """ユーザ情報のみを返却する"""
        data = super(RankPerLabSerializer, self).to_representation(instance)
        return data['user']

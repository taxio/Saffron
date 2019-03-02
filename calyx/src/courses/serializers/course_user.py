from django.contrib.auth import get_user_model
from rest_framework import serializers

from courses.errors import AlreadyJoinedError
from courses.services import StatusMessage
from .course import PINCodeSerializer

User = get_user_model()


class CourseStatusDetailSerializer(serializers.Serializer):
    """
    各設定項目を満たしているかどうかを表現するSerializer
    """

    gpa = serializers.BooleanField(read_only=True)
    screen_name = serializers.BooleanField(read_only=True)
    rank_submitted = serializers.BooleanField(read_only=True)


class CourseStatusSerializer(serializers.Serializer):
    """
    課程の要求する設定項目を満たしているかどうかをチェックするViewのためのSerializer
    """
    status = serializers.CharField(read_only=True)
    status_message = serializers.CharField(read_only=True)
    detail = CourseStatusDetailSerializer(read_only=True)

    def to_representation(self, instance):
        """Userインスタンスからステータスをチェックする"""
        course_pk = self.context['course_pk']
        status_msg = StatusMessage(instance, course_pk)
        return super(CourseStatusSerializer, self).to_representation(status_msg)


class JoinSerializer(PINCodeSerializer):
    """
    ユーザを課程にJoinさせる
    """

    def update(self, instance, validated_data):
        """
        課程を受取って，contextからユーザを取得し，POSTされたpin_codeを使って課程に参加する
        """
        user = self.context.get('user', None)
        if user is None:
            raise AttributeError
        try:
            # 参加に成功すればTrue，失敗すればFalse
            joined = instance.join(user, validated_data['pin_code'])
            if not joined:
                raise serializers.ValidationError({'pin_code': 'PINコードが正しくありません．'})
        except AlreadyJoinedError:
            raise serializers.ValidationError({'non_field_errors': 'このユーザは既に参加しています．'})
        return instance

from django.contrib.auth import get_user_model
from rest_framework import serializers

from courses.status import StatusMessage

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

from django.db.models import Prefetch
from django.contrib.auth import get_user_model
from rest_framework import viewsets, permissions
from .models import Course
from .serializers import CourseSerializer, CourseWithoutUserSerializer
from .permissions import IsAdmin, IsCourseMember, IsCourseAdmin

User = get_user_model()


class CourseViewSet(viewsets.ModelViewSet):
    """
    課程のAPIビュー

    retrieve:
        課程の詳細情報と所属するユーザを取得する
    list:
        課程の一覧を取得する
    create:
        新しい課程を作成する
    destroy:
        指定した課程を削除する
    update:
        指定した課程の情報を更新する
    partial_update:
        指定した課程のパラメータ（全てでなくて良い）を指定して更新する
    """

    queryset = Course.objects.prefetch_related(
        Prefetch('users', User.objects.prefetch_related('groups').filter(joined=True).all())
    ).select_related('year').all()
    serializer_class = CourseSerializer

    def get_permissions(self):
        if self.action == 'list' or self.action == 'create':
            self.permission_classes = [permissions.AllowAny]
        elif self.action == 'retrieve':
            self.permission_classes = [IsCourseMember | IsAdmin]
        else:
            self.permission_classes = [(IsCourseMember & IsCourseAdmin) | IsAdmin]
        return super(CourseViewSet, self).get_permissions()

    def get_serializer_class(self):
        if self.action == 'list':
            return CourseWithoutUserSerializer
        return super(CourseViewSet, self).get_serializer_class()

    def perform_create(self, serializer):
        course = serializer.save()
        course.register_as_admin(self.request.user)

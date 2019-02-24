from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Prefetch
from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets, permissions, mixins, exceptions
from rest_framework.response import Response
from rest_framework_nested.viewsets import NestedViewSetMixin

from courses.models import Course, Year, Config
from courses.permissions import (
    IsAdmin, IsCourseMember, IsCourseAdmin, GPARequirement, ScreenNameRequirement
)
from courses.schemas import CourseJoinSchema
from courses.serializers import (
    CourseSerializer, CourseWithoutUserSerializer, YearSerializer, ConfigSerializer
)

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
        Prefetch('users', User.objects.prefetch_related('groups', 'courses').all()),
    ).select_related('year').all()
    serializer_class = CourseSerializer

    def get_permissions(self):
        if self.action == 'list' or self.action == 'create':
            self.permission_classes = [permissions.IsAuthenticated]
        elif self.action == 'retrieve':
            self.permission_classes = [(IsCourseMember & GPARequirement & ScreenNameRequirement) | IsAdmin]
        else:
            self.permission_classes = [(IsCourseMember & IsCourseAdmin) | IsAdmin]
        return super(CourseViewSet, self).get_permissions()

    def get_serializer_class(self):
        if self.action == 'list':
            return CourseWithoutUserSerializer
        return super(CourseViewSet, self).get_serializer_class()

    def perform_create(self, serializer):
        with transaction.atomic():
            course = serializer.save()
            course.register_as_admin(self.request.user)


class YearViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    年度の情報を取得するAPIビュー

    list:
        年度の一覧を取得する
    """

    queryset = Year.objects.prefetch_related('courses').all()
    serializer_class = YearSerializer
    permission_classes = [permissions.IsAuthenticated]


class CourseConfigViewSet(NestedViewSetMixin,
                          mixins.ListModelMixin,
                          mixins.CreateModelMixin,
                          viewsets.GenericViewSet):
    """
    課程ごとの表示設定に関するView
    list:
        表示設定を取得する
    create:
        表示設定を更新する
    """

    queryset = Config.objects.select_related('course').all()
    serializer_class = ConfigSerializer
    schema = CourseJoinSchema()

    def get_permissions(self):
        if self.action == 'list':
            self.permission_classes = [IsCourseMember | IsAdmin]
        else:
            self.permission_classes = [(IsCourseMember & IsCourseAdmin) | IsAdmin]
        return super(CourseConfigViewSet, self).get_permissions()

    def get_object(self):
        obj = self.get_queryset().first()
        if obj is None:
            raise exceptions.NotFound('設定が見つかりませんでした．')
        self.check_object_permissions(self.request, obj.course)
        return obj

    def create(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}
        return Response(serializer.data)

    @swagger_auto_schema(responses={
        200: ConfigSerializer,
        401: "ログインしていません",
        403: "課程に参加していません",
        404: "指定した課程は存在しません"
    })
    def list(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

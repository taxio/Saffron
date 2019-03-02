from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Prefetch
from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets, permissions, mixins, status
from rest_framework.response import Response

from courses.models import Course, Year, Config
from courses.permissions import (
    IsAdmin, IsCourseMember, IsCourseAdmin, GPARequirement, ScreenNameRequirement
)
from courses.serializers import (
    ReadOnlyCourseSerializer, CourseUpdateSerializer, CourseCreateSerializer,
    CourseWithoutUserSerializer, YearSerializer, ConfigSerializer
)
from .mixins import CourseNestedMixin

User = get_user_model()


class CourseViewSet(mixins.RetrieveModelMixin,
                    mixins.CreateModelMixin,
                    mixins.DestroyModelMixin,
                    mixins.ListModelMixin,
                    viewsets.GenericViewSet):
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
    partial_update:
        指定した課程のパラメータ（全てでなくて良い）を指定して更新する
    """

    queryset = Course.objects.prefetch_related(
        Prefetch('users', User.objects.prefetch_related('groups', 'courses').all()),
    ).select_related('year').all()
    serializer_class = ReadOnlyCourseSerializer

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
        elif self.action == 'retrieve':
            return ReadOnlyCourseSerializer
        elif self.action == 'create':
            return CourseCreateSerializer
        elif self.action == 'update' or self.action == 'partial_update':
            return CourseUpdateSerializer
        return super(CourseViewSet, self).get_serializer_class()

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance=instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        resp_serializer = ReadOnlyCourseSerializer(instance, context=self.get_serializer_context())
        return Response(resp_serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        course = self.perform_create(serializer)
        resp_serializer = ReadOnlyCourseSerializer(course, context=self.get_serializer_context())
        headers = self.get_success_headers(resp_serializer.data)
        return Response(resp_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        with transaction.atomic():
            course = serializer.save()
            course.register_as_admin(self.request.user)
        return course


class YearViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    年度の情報を取得するAPIビュー

    list:
        年度の一覧を取得する
    """

    queryset = Year.objects.prefetch_related('courses').all()
    serializer_class = YearSerializer
    permission_classes = [permissions.IsAuthenticated]


class CourseConfigViewSet(CourseNestedMixin,
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

    def get_permissions(self):
        if self.action == 'list':
            self.permission_classes = [IsCourseMember | IsAdmin]
        else:
            self.permission_classes = [(IsCourseMember & IsCourseAdmin) | IsAdmin]
        return super(CourseConfigViewSet, self).get_permissions()

    def create(self, request, *args, **kwargs):
        instance = self.get_course().config
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
        instance = self.get_course().config
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

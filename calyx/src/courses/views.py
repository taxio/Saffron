from django.db import transaction
from django.db.models import Prefetch
from django.contrib.auth import get_user_model
from rest_framework import viewsets, permissions, mixins, serializers, status, exceptions
from rest_framework.response import Response
from rest_framework_nested.viewsets import NestedViewSetMixin
from .models import Course, Year
from .serializers import (
    CourseSerializer, CourseWithoutUserSerializer, YearSerializer, PINCodeSerializer, UserSerializer
)
from .permissions import IsAdmin, IsCourseMember, IsCourseAdmin
from .errors import AlreadyJoinedError, NotJoinedError
from .schemas import CourseJoinSchema, CourseAdminSchema

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
            self.permission_classes = [IsCourseMember | IsAdmin]
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


class JoinAPIView(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """
    課程に参加するAPIビュー

    create:
        課程に参加する
    """
    queryset = Course.objects.prefetch_related(
        Prefetch('users', User.objects.prefetch_related('groups', 'courses').all()),
    ).select_related('admin_user_group', 'year').all()
    serializer_class = PINCodeSerializer
    permission_classes = [permissions.IsAuthenticated]
    schema = CourseJoinSchema()

    def create(self, request, course_pk=None, *args, **kwargs):
        if not isinstance(course_pk, int):
            course_pk = int(course_pk)
        try:
            course = self.get_queryset().get(pk=course_pk)
        except Course.DoesNotExist:
            raise exceptions.NotFound('この課程は存在しません．')
        # PINコードをパース
        pin_code_serializer = self.get_serializer(data=request.data)
        pin_code_serializer.is_valid(raise_exception=True)
        pin_code = pin_code_serializer.validated_data['pin_code']
        try:
            # 参加に成功すればTrue，失敗すればFalse
            joined = course.join(request.user, pin_code)
            if not joined:
                raise serializers.ValidationError({'pin_code': 'PINコードが正しくありません．'})
        except AlreadyJoinedError:
            raise serializers.ValidationError({'non_field_errors': 'このユーザは既に参加しています．'})
        course_serializer = CourseSerializer(course, context=self.get_serializer_context())
        headers = self.get_success_headers(course_serializer.data)
        return Response(course_serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class CourseAdminView(NestedViewSetMixin, mixins.UpdateModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    各課程の管理者に関するView
    update:
        IDを指定して管理者でないユーザを管理者に昇格する
    partial_update:
        IDを指定して管理者でないユーザを管理者に昇格する
    list:
        管理者一覧を表示する
    """

    queryset = Course.objects.prefetch_related(
        Prefetch('users', User.objects.prefetch_related('groups', 'courses').all()),
    ).select_related('admin_user_group', 'year').all()
    serializer_class = UserSerializer
    schema = CourseAdminSchema()

    def get_permissions(self):
        if self.action == 'list':
            self.permission_classes = [IsCourseMember]
        else:
            self.permission_classes = [IsCourseMember & IsCourseAdmin]
        return super(CourseAdminView, self).get_permissions()

    def update(self, request, *args, **kwargs):
        pk = kwargs.pop('pk')
        course = self.get_queryset().first()
        if course is None:
            raise exceptions.NotFound('この課程は存在しません．')
        self.check_object_permissions(self.request, course)
        try:
            user = course.users.get(pk=pk)
        except User.DoesNotExist:
            raise exceptions.NotFound('指定されたユーザはこの課程に参加していないか，存在しません．')
        try:
            if user.groups.filter(name=course.admin_group_name).exists():
                raise serializers.ValidationError({'non_field_errors': 'このユーザは既に管理者として登録されています．'})
            course.register_as_admin(user)
        except NotJoinedError:
            raise serializers.ValidationError({'non_field_errors': 'このユーザはこの課程のメンバーではありません'})
        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def list(self, request, *args, **kwargs):
        course = self.get_queryset().first()
        if course is None:
            raise exceptions.NotFound('この課程は存在しません．')
        self.check_object_permissions(self.request, course)
        admins = course.users.filter(groups__name=course.admin_group_name).all()
        serializer = self.get_serializer(admins, many=True)
        return Response(serializer.data)

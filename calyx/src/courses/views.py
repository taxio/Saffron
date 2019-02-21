from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Prefetch
from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets, permissions, mixins, serializers, status, exceptions
from rest_framework.response import Response
from rest_framework_nested.viewsets import NestedViewSetMixin

from .errors import AlreadyJoinedError, NotJoinedError, NotAdminError
from .models import Course, Year, Config, Lab, Rank
from .permissions import (
    IsAdmin, IsCourseMember, IsCourseAdmin, GPARequirement, ScreenNameRequirement, RankSubmitted
)
from .schemas import CourseJoinSchema, CourseAdminSchema, LabSchema
from .serializers import (
    CourseSerializer, CourseWithoutUserSerializer, YearSerializer, PINCodeSerializer, LabListCreateSerializer,
    UserSerializer, ConfigSerializer, LabSerializer, RankSerializer, LabAbstractSerializer, CourseStatusSerializer
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


class RequirementStatusView(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    課程の設定と照らし合わせてそのユーザが要求を満たしているかどうかをチェックするビュー

    list:
        要求を満たしているかどうかの状態を取得する
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CourseStatusSerializer

    @swagger_auto_schema(responses={
        200: CourseStatusSerializer,
        401: "ログインしていません",
        403: "課程に参加していません",
        404: "指定した課程は存在しません"
    })
    def list(self, request, **kwargs):
        course_pk = kwargs.get('course_pk')
        if not isinstance(course_pk, int):
            course_pk = int(course_pk)
        try:
            course = Course.objects.get(pk=course_pk)
            self.check_object_permissions(request, course)
        except Course.DoesNotExist:
            raise exceptions.NotFound('この課程は存在しません．')
        serializer_context = self.get_serializer_context()
        serializer_context['course_pk'] = course_pk
        serializer = CourseStatusSerializer(instance=request.user, context=serializer_context)
        return Response(serializer.data)


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


class CourseAdminView(mixins.UpdateModelMixin,
                      mixins.ListModelMixin,
                      mixins.DestroyModelMixin,
                      viewsets.GenericViewSet):
    """
    各課程の管理者に関するView
    update:
        IDを指定して管理者でないユーザを管理者に昇格する
    partial_update:
        IDを指定して管理者でないユーザを管理者に昇格する
    list:
        管理者一覧を表示する
    destroy:
        IDを指定して管理者から外す
    """

    queryset = Course.objects.prefetch_related(
        Prefetch('users', User.objects.prefetch_related('groups', 'courses').all()),
    ).select_related('admin_user_group', 'year')
    serializer_class = UserSerializer
    schema = CourseAdminSchema()

    def get_permissions(self):
        if self.action == 'list':
            self.permission_classes = [IsCourseMember | IsAdmin]
        else:
            self.permission_classes = [(IsCourseMember & IsCourseAdmin) | IsAdmin]
        return super(CourseAdminView, self).get_permissions()

    def get_course(self, kwargs):
        course_pk = kwargs.get('course_pk', None)
        if course_pk is None:
            return None
        if isinstance(course_pk, str):
            course_pk = int(course_pk)
        try:
            course = self.get_queryset().get(pk=course_pk)
        except Course.DoesNotExist:
            raise exceptions.NotFound('この課程は存在しません．')
        return course

    def update(self, request, *args, **kwargs):
        pk = kwargs.pop('pk')
        if not isinstance(pk, int):
            pk = int(pk)
        course = self.get_course(kwargs)
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

    def destroy(self, request, *args, **kwargs):
        pk = kwargs.pop('pk')
        if not isinstance(pk, int):
            pk = int(pk)
        course = self.get_course(kwargs)
        self.check_object_permissions(self.request, course)
        if request.user.pk == pk:
            raise serializers.ValidationError({'non_field_errors': '自分自身を管理者から外すことは出来ません．'})
        try:
            user = course.users.get(pk=pk)
        except User.DoesNotExist:
            raise exceptions.NotFound('指定されたユーザはこの課程に参加していないか，存在しません．')
        try:
            course.unregister_from_admin(user)
        except NotAdminError:
            raise serializers.ValidationError({'non_field_errors': 'このユーザは管理者として登録されていません．'})
        return Response(status=status.HTTP_204_NO_CONTENT)

    def list(self, request, *args, **kwargs):
        course = self.get_course(kwargs)
        self.check_object_permissions(self.request, course)
        admins = course.users.filter(groups__name=course.admin_group_name).all()
        serializer = self.get_serializer(admins, many=True)
        return Response(serializer.data)


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


class LabViewSet(NestedViewSetMixin, viewsets.ModelViewSet):
    """
    研究室を操作するView．
    """

    queryset = Lab.objects.select_related('course').all()
    schema = LabSchema()

    def get_serializer_class(self):
        if self.action == 'list' or self.action == 'create':
            return LabAbstractSerializer
        return LabSerializer

    def get_permissions(self):
        if self.action == "list":
            self.permission_classes = [IsCourseMember | IsAdmin]
        elif self.action == "retrieve":
            self.permission_classes = [(IsCourseMember & GPARequirement &
                                        ScreenNameRequirement & RankSubmitted) | IsAdmin]
        else:
            self.permission_classes = [(IsCourseMember & IsCourseAdmin) | IsAdmin]
        return super(LabViewSet, self).get_permissions()

    def list(self, request, *args, **kwargs):
        course_pk = kwargs.pop('course_pk')
        try:
            self.course = Course.objects.prefetch_related('users').select_related('year').get(pk=course_pk)
        except Course.DoesNotExist:
            raise exceptions.NotFound('この課程は存在しません．')
        self.check_object_permissions(request, self.course)
        return super(LabViewSet, self).list(request, *args, **kwargs)

    def get_object(self):
        pk = self.kwargs.pop('pk')
        course_pk = self.kwargs.get('course_pk', None)
        try:
            obj = Lab.objects.filter(course_id=course_pk).select_related('course').get(pk=pk)
        except Lab.DoesNotExist:
            raise exceptions.NotFound('見つかりませんでした．')
        self.check_object_permissions(self.request, obj.course)
        self.course = obj.course
        return obj

    def get_serializer_context(self):
        context = super(LabViewSet, self).get_serializer_context()
        if hasattr(self, 'course'):
            context['course'] = self.course
        return context

    @swagger_auto_schema(responses={
        201: LabAbstractSerializer(many=True),
        400: 'Validation error',
        403: 'ログインしていない，またはこの課程に参加していません'}
    )
    def create(self, request, *args, **kwargs):
        course_pk = kwargs.pop('course_pk')
        try:
            self.course = Course.objects.prefetch_related('users').select_related('year').get(pk=course_pk)
        except Course.DoesNotExist:
            raise exceptions.NotFound('この課程は存在しません．')
        self.check_object_permissions(request, self.course)
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class RankViewSet(NestedViewSetMixin, mixins.ListModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    """
    自分自身の希望順位を提出する
    create:
        希望する順に並べた研究室のプライマリキーを送信して希望順位を提出する
    list:
        自分がこの課程に提出した希望順位を取得する
    """

    queryset = Rank.objects.select_related('course', 'lab')
    permission_classes = [IsCourseMember]
    serializer_class = RankSerializer

    def get_serializer_class(self):
        if self.action == 'create':
            return RankSerializer
        return LabSerializer

    def get_serializer_context(self):
        context = super(RankViewSet, self).get_serializer_context()
        if hasattr(self, 'course'):
            context['course'] = self.course
        return context

    def get_queryset(self):
        queryset = super(RankViewSet, self).get_queryset()
        queryset = queryset.filter(user=self.request.user).order_by('order').all()
        return [rank.lab for rank in queryset]

    def list(self, request, *args, **kwargs):
        course_pk = kwargs.pop('course_pk')
        try:
            self.course = Course.objects.prefetch_related('users').select_related('year').get(pk=course_pk)
        except Course.DoesNotExist:
            raise exceptions.NotFound('この課程は存在しません．')
        self.check_object_permissions(request, self.course)
        return super(RankViewSet, self).list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        course_pk = kwargs.get('course_pk')
        try:
            self.course = Course.objects.prefetch_related('users').select_related('year', 'config').get(pk=course_pk)
        except Course.DoesNotExist:
            raise exceptions.NotFound('この課程は存在しません．')
        self.check_object_permissions(request, self.course)
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

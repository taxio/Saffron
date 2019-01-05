from django.db import transaction
from django.db.models import Prefetch
from django.contrib.auth import get_user_model
from rest_framework import viewsets, permissions, mixins, serializers, status, exceptions
from rest_framework.response import Response
from .models import Course, Year
from .serializers import CourseSerializer, CourseWithoutUserSerializer, YearSerializer, PINCodeSerializer
from .permissions import IsAdmin, IsCourseMember, IsCourseAdmin
from .errors import AlreadyJoinedError

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
    serializer_class = CourseSerializer
    permission_classes = [IsCourseMember | IsAdmin]

    def create(self, request, course_pk=None, *args, **kwargs):
        """
        POSTされたら送ったユーザを課程に参加させる
        :param request: リクエストオブジェクト
        :param course_pk: Course APIにネストされているため，そのプライマリキーを取得できる
        :param args:
        :param kwargs:
        :return:
        """
        if not isinstance(course_pk, int):
            course_pk = int(course_pk)
        try:
            course = self.get_queryset().get(pk=course_pk)
        except Course.DoesNotExist:
            raise exceptions.NotFound({'non_field_errors': 'この課程は存在しません．'})
        # PINコードをパース
        pin_code_serializer = PINCodeSerializer(data=request.data)
        pin_code_serializer.is_valid(raise_exception=True)
        pin_code = pin_code_serializer.validated_data['pin_code']
        try:
            # 参加に成功すればTrue，失敗すればFalse
            joined = course.join(request.user, pin_code)
            if not joined:
                raise serializers.ValidationError({'pin_code': 'PINコードが正しくありません．'})
        except AlreadyJoinedError:
            raise serializers.ValidationError({'non_field_errors': 'このユーザは既に参加しています．'})
        course_serializer = CourseSerializer(course)
        headers = self.get_success_headers(course_serializer.data)
        return Response(course_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

from django.contrib.auth import get_user_model
from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets, mixins, status, exceptions, decorators
from rest_framework.response import Response

from courses.models import Course, Rank
from courses.permissions import (
    IsCourseMember, IsAdmin, GPARequirement, ScreenNameRequirement, RankSubmitted
)
from courses.serializers import (
    LabSerializer, RankSerializer
)
from courses.services import get_summary
from .mixins import NestedViewSetMixin

User = get_user_model()


class RankViewSet(NestedViewSetMixin, mixins.ListModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    """
    自分自身の希望順位を提出する
    create:
        希望する順に並べた研究室のプライマリキーを送信して希望順位を提出する
    list:
        自分がこの課程に提出した希望順位を取得する
    """

    queryset = Rank.objects.select_related('course', 'lab')
    permission_classes = [IsCourseMember | IsAdmin]
    serializer_class = RankSerializer

    def get_permissions(self):
        if self.action == 'summary':
            self.permission_classes = [
                (IsCourseMember & GPARequirement & RankSubmitted & ScreenNameRequirement) | IsAdmin
            ]
        return super(RankViewSet, self).get_permissions()

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

    @swagger_auto_schema(
        request_body=RankSerializer(many=True)
    )
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

    @decorators.action(['GET'], detail=False, url_path='summary')
    def summary(self, request, *args, **kwargs):
        """希望調査のサマリーを取得する"""
        course_pk = kwargs.pop('course_pk')
        try:
            course = Course.objects.get(pk=course_pk)
        except Course.DoesNotExist:
            return exceptions.NotFound('この課程は存在しません')
        self.check_object_permissions(request, course)
        return Response(get_summary(course))

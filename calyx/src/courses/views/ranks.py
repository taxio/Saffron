from django.contrib.auth import get_user_model
from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets, mixins, status, decorators
from rest_framework.response import Response

from courses.models import Rank, Lab
from courses.permissions import (
    IsCourseMember, IsAdmin, GPARequirement, ScreenNameRequirement, RankSubmitted
)
from courses.serializers import (
    LabSerializer, LabAbstractSerializer, RankSerializer, RankSummaryPerLabSerializer
)
from courses.services import get_summary, update_summary_cache
from .mixins import NestedViewSetMixin, CourseNestedMixin

User = get_user_model()


class RankViewSet(NestedViewSetMixin,
                  CourseNestedMixin,
                  mixins.ListModelMixin,
                  mixins.CreateModelMixin,
                  viewsets.GenericViewSet):
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
        if self.action == 'list':
            return LabAbstractSerializer
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

    @swagger_auto_schema(
        responses={
            200: LabAbstractSerializer(many=True),
            403: "閲覧資格を満たしていません",
            404: "存在しない課程です"
        }
    )
    def list(self, request, *args, **kwargs):
        course = self.get_course()
        lab_submitted = Lab.objects.filter(course_id=course.pk).prefetch_related('rank_set') \
            .filter(rank__user=request.user).order_by('rank__order').all()
        serializer = LabAbstractSerializer(lab_submitted, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        request_body=RankSerializer(many=True)
    )
    def create(self, request, *args, **kwargs):
        course = self.get_course()
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        update_summary_cache(course)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @swagger_auto_schema(responses={
        200: RankSummaryPerLabSerializer(read_only=True, many=True),
        403: "閲覧資格を満たしていません",
        404: "存在しない課程です"
    })
    @decorators.action(['GET'], detail=False, url_path='summary')
    def summary(self, request, *args, **kwargs):
        """希望調査のサマリーを取得する"""
        course = self.get_course()
        return Response(get_summary(course))

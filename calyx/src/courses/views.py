from rest_framework import viewsets, permissions
from .models import Course
from .serializers import CourseSerializer


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
    """

    queryset = Course.objects.prefetch_related('users').select_related('year').all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]


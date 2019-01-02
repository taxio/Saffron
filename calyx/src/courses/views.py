from rest_framework import viewsets, permissions
from .models import Course
from .serializers import CourseSerializer


class CourseViewSet(viewsets.ModelViewSet):
    """
    課程のAPIビュー
    """

    queryset = Course.objects.prefetch_related('users').select_related('year').all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]


from django.urls import path, include
from rest_framework import routers
from rest_framework_nested.routers import NestedDefaultRouter

from .views import (
    CourseViewSet, YearViewSet, JoinAPIView, CourseAdminView,
    CourseConfigViewSet, LabViewSet, RankViewSet
)

router = routers.DefaultRouter()

router.register('courses', CourseViewSet, basename='course')
router.register('years', YearViewSet, basename='year')

course_nested_router = NestedDefaultRouter(router, r'courses', lookup='course')
course_nested_router.register('join', JoinAPIView, basename='join')
course_nested_router.register('admins', CourseAdminView, basename='admin')
course_nested_router.register('config', CourseConfigViewSet, basename='config')
course_nested_router.register('labs', LabViewSet, basename='lab')
course_nested_router.register('ranks', RankViewSet, basename='rank')

app_name = 'course'
urlpatterns = [
    path('', include(router.get_urls())),
    path('', include(course_nested_router.get_urls())),
]

from django.urls import path, include
from rest_framework import routers
from rest_framework_nested.routers import NestedDefaultRouter
from .views import CourseViewSet, YearViewSet, JoinAPIView

router = routers.DefaultRouter()

router.register('courses', CourseViewSet, basename='course')
router.register('years', YearViewSet, basename='year')

course_nested_router = NestedDefaultRouter(router, r'courses', lookup='course')
course_nested_router.register('join', JoinAPIView, basename='join')

app_name = 'course'
urlpatterns = [
    path('', include(router.urls)),
    path('', include(course_nested_router.urls)),
]

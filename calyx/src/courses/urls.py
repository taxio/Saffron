from django.urls import path, include
from rest_framework import routers
from .views import CourseViewSet, YearViewSet

router = routers.DefaultRouter()

router.register('courses', CourseViewSet, basename='course')
router.register('years', YearViewSet, basename='year')

app_name = 'course'
urlpatterns = [
    path('', include(router.urls))
]

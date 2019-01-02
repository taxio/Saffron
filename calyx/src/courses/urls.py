from django.urls import path, include
from rest_framework import routers
from .views import CourseViewSet

router = routers.DefaultRouter()

router.register('', CourseViewSet, basename='course')

app_name = 'course'
urlpatterns = [
    path('', include(router.urls))
]

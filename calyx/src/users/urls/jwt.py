from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView


from users.token import TokenObtainPairView

urlpatterns = [
    path('jwt/create/', TokenObtainPairView.as_view(), name='jwt-create'),
    path('jwt/refresh/', TokenRefreshView.as_view(), name='jwt-refresh'),
    path('jwt/verify/', TokenVerifyView.as_view(), name='jwt-verify')
]

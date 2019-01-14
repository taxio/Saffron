from django.urls import path
from djoser import views as djoser_views
from .views import Login, Logout, MeViewSet, UserDeleteView

app_name = 'accounts'

urlpatterns = [
    path(
        'login/',
        Login.as_view(),
        name='login'
    ),
    path(
        'logout/',
        Logout.as_view(),
        name='logout'
    ),
    path(
        'password/',
        djoser_views.SetPasswordView.as_view(),
        name='set_password'
    ),
    path(
        'password/reset/',
        djoser_views.PasswordResetView.as_view(),
        name='password_reset'
    ),
    path(
        'password/reset/confirm/',
        djoser_views.PasswordResetConfirmView.as_view(),
        name='password_reset_confirm'
    ),
    path(
        'users/create/',
        djoser_views.UserCreateView.as_view(),
        name='user-create'
    ),
    path(
        'users/activate/',
        djoser_views.ActivationView.as_view(),
        name='user-activate'
    ),
    path(
        'me/',
        MeViewSet.as_view(),
        name='me'
    ),
    path(
        'me/delete/',
        UserDeleteView.as_view(),
        name='me-delete'
    ),
    # TODO: パスワードを変更するme/password/を実装する
]

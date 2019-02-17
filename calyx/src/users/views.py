from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.views import LoginView, LogoutView
from rest_framework import status, generics, response, permissions
from rest_framework.response import Response
from djoser.conf import settings as djoser_settings
from djoser.utils import logout_user
from .forms import LoginForm
from .permissions import IsOwner
from .serializers import UserSerializer, PasswordValidationSerializer


class Login(LoginView):
    """ログインページ"""
    form_class = LoginForm
    template_name = 'login.html'


class Logout(LoginRequiredMixin, LogoutView):
    """ログアウトページ"""
    template_name = 'top.html'


class MeViewSet(generics.RetrieveAPIView,
                generics.GenericAPIView):
    """
    自分自身の情報を閲覧・更新するエンドポイント
    retrieve:
        自分自身の情報を取得する
    partial_update:
        自分自身の情報を更新する
    """

    permission_classes = [IsOwner]
    serializer_class = UserSerializer

    def get_object(self):
        """自分自身を返す"""
        user = self.request.user
        self.check_object_permissions(self.request, user)
        return user

    def get(self, request, *args, **kwargs):
        current_user = self.get_object()
        serializer = self.get_serializer(current_user)
        return response.Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        current_user = self.get_object()
        serializer = self.get_serializer(instance=current_user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        if getattr(current_user, '_prefetched_objects_cache', None):
            current_user._prefetched_objects_cache = {}
        return response.Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)


class UserDeleteView(generics.CreateAPIView,
                     generics.GenericAPIView):
    """
    パスワードをPOSTしてアカウントを削除する
    """
    serializer_class = djoser_settings.SERIALIZERS.user_delete
    permission_classes = [IsOwner]

    def post(self, request, *args, **kwargs):
        current_user = self.get_object()
        serializer = self.get_serializer(instance=current_user, data=request.data)
        serializer.is_valid(raise_exception=True)
        logout_user(request)
        current_user.delete()
        return response.Response(status=status.HTTP_204_NO_CONTENT)

    def get_object(self):
        """自分自身を返す"""
        user = self.request.user
        self.check_object_permissions(self.request, user)
        return user


class PasswordValidationView(generics.CreateAPIView, generics.GenericAPIView):
    """
    パスワード（またはPINコード）のバリデーションを行う．typeには`user`または`pin_code`を選択可能．
    """
    serializer_class = PasswordValidationSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

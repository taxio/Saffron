from rest_framework_simplejwt.serializers import TokenObtainPairSerializer as OrigTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView as OrigTokenObtainPairView


class TokenObtainPairSerializer(OrigTokenObtainPairSerializer):
    """デフォルトのアクセストークンに含まれない属性を付与する"""

    @classmethod
    def get_token(cls, user):
        token = super(TokenObtainPairSerializer, cls).get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        return token


class TokenObtainPairView(OrigTokenObtainPairView):
    """ユーザ名とパスワードを受け取ってアクセストークンとリフレッシュトークンを返す"""

    serializer_class = TokenObtainPairSerializer

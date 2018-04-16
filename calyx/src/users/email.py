from django.conf import settings
from djoser.email import ActivationEmail


class SaffronActivationEmail(ActivationEmail, object):
    """
    アカウント有効化のメール本文作成クラス
    """

    def get_context_data(self):
        """
        テンプレートに埋め込む変数をオーバーライド
        :return: context
        """
        context = super(SaffronActivationEmail, self).get_context_data()
        # デフォルトのdomain, protocolはAPIサーバの実行URLが使用される
        # 環境変数を設定してオーバーライド
        context['domain'] = settings.PETALS_DOMAIN
        context['protocol'] = settings.PETALS_PROTOCOL
        # 運営の問い合わせ情報を埋め込み
        context['management_team_name'] = settings.MANAGEMENT_TEAM_NAME
        context['management_team_email'] = settings.MANAGEMENT_TEAM_EMAIL
        return context

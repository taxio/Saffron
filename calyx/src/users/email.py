from django.conf import settings
from djoser.email import ActivationEmail, ConfirmationEmail


def set_saffron_info(context):
    """
    デフォルトのdomain, protocolはAPIサーバの実行URLが使用されるため、環境変数でオーバーライドする
    """
    # フロントエンドの実行ドメイン及びプロトコル
    context['domain'] = settings.PETALS_DOMAIN
    context['protocol'] = settings.PETALS_PROTOCOL
    # 運営の問い合わせ情報を埋め込み
    context['management_team_name'] = settings.MANAGEMENT_TEAM_NAME
    context['management_team_email'] = settings.MANAGEMENT_TEAM_EMAIL
    return context


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
        return set_saffron_info(context)


class SaffronConfirmationEmail(ConfirmationEmail, object):
    """
    アカウントアクティベート後の確認メール本文作成クラス
    """
    def get_context_data(self, **kwargs):
        """
        テンプレートに埋め込む変数をオーバーライド
        :param kwargs:
        :return: context
        """
        context = super(SaffronConfirmationEmail, self).get_context_data(**kwargs)
        return set_saffron_info(context)

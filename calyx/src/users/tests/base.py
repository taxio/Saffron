class UserDatasetMixin(object):

    def setUp(self):
        self.valid_passwords = [
            'hogefuga', 'piyopoyo', 'fugapoyo'
        ]
        self.invalid_passwords = [
            # 短すぎる
            'hoge',
            # 一般的すぎる
            'password',
            # 短すぎるかつ一般的すぎる
            'pass',
            # 数字のみで構成されている
            '135791113'
        ]
        self.valid_pin_codes = [
            'hoge', 'hogefuga', '3125'
        ]
        self.invalid_pin_codes = [
            # 短すぎる
            'po',
            # 一般的すぎる
            'pass',
            '1234',
            # 短すぎるかつ一般的すぎる
            '123'
        ]

import json
from copy import deepcopy
from collections import OrderedDict
from rest_framework_jwt.settings import api_settings


years = [2017, 2018, 2019]

default_config = {
    'show_gpa': False,
    'show_username': False,
    'rank_limit': 3
}

lab_data_set = [
    {
        "name": "Lab A",
        "capacity": 2
    }, {
        "name": "Lab B",
        "capacity": 4
    }
]

course_data_set = [
    {
        "name": "Course A",
        "year": 2018,
        "pin_code": "3012",
        "config": deepcopy(default_config)
    }, {
        "name": "Course B",
        "pin_code": "aaabbbcccddd",
        "config": deepcopy(default_config)
    }, {
        "name": "ﾎｹﾞ",
        "year": 2018,
        "pin_code": "4123",
        "config": deepcopy(default_config)
    }
]

user_data_set = [
    {
        "username": "b0000000",
        "password": "password"
    }, {
        "username": "m0000000",
        "password": "password"
    }
]


class DatasetMixin(object):

    def setUp(self):
        self.course_data_set = deepcopy(course_data_set)
        self.user_data_set = deepcopy(user_data_set)
        self.years = deepcopy(years)
        self.default_config = deepcopy(default_config)
        self.lab_data_set = deepcopy(lab_data_set)

    def to_dict(self, data: OrderedDict) -> dict:
        """OrderedDictを標準のdictに変換する"""
        return json.loads(json.dumps(data, ensure_ascii=False))


class JWTAuthMixin(object):

    def _set_credentials(self, user=None):
        if not user:
            user = self.user
        jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
        jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER
        payload = jwt_payload_handler(user)
        token = jwt_encode_handler(payload)
        self.client.credentials(HTTP_AUTHORIZATION="JWT " + token)

    def _unset_credentials(self):
        self.client.credentials(HTTP_AUTHORIZATION="")

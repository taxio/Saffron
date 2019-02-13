import json
from copy import deepcopy
from collections import OrderedDict
from typing import TYPE_CHECKING
from rest_framework_jwt.settings import api_settings

from courses.models import Lab, Rank

if TYPE_CHECKING:
    from courses.models import Course
    from typing import List, Dict


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
    }, {
        "name": "Lab C",
        "capacity": 6
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
        "password": "hogefuga"
    }, {
        "username": "m0000000",
        "password": "piyopoyo",
        "screen_name": "表示名"
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

    def create_labs(self, course: 'Course') -> 'List[Lab]':
        return [Lab.objects.create(**lab_data, course=course) for lab_data in self.lab_data_set]

    def submit_ranks(self, labs: "List[Lab]", user) -> 'List[Rank]':
        ranks = []
        for i, lab in enumerate(labs):
            rank = Rank.objects.create(lab=lab, course=lab.course, user=user, order=i)
            ranks.append(rank)
        return ranks

    def create_rank_order(self, labs: 'List[Lab]') -> 'List[Dict[str, int]]':
        return [{'lab': lab.pk for lab in labs}]


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

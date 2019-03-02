import json
from collections import OrderedDict
from itertools import product

from copy import deepcopy
from typing import TYPE_CHECKING

from django.db.models import signals
from django.utils.six import text_type
from rest_framework_simplejwt.tokens import RefreshToken

from courses.models import Lab, Rank, Config
from courses.signals import update_rank_summary_when_capacity_changed
from courses.utils import disable_signal

if TYPE_CHECKING:
    from courses.models import Course
    from typing import List, Dict, Union

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
    }, {
        "username": "d0000000",
        "password": "hogehoge"
    }
]


class DatasetMixin(object):
    config_keys = ["show_username", "show_gpa", "rank_limit"]

    show_username_patterns = [True, False]
    show_gpa_patterns = [True, False]
    rank_limit_patterns = [3]

    def setUp(self):
        self.course_data_set = deepcopy(course_data_set)
        self.user_data_set = deepcopy(user_data_set)
        self.years = deepcopy(years)
        self.default_config = deepcopy(default_config)
        self.lab_data_set = deepcopy(lab_data_set)
        self.config_patterns = self._make_config_patterns()

    def _make_config_patterns(self):
        patterns = list(product(
            self.show_username_patterns, self.show_gpa_patterns, self.rank_limit_patterns
        ))
        return [dict(zip(self.config_keys, pattern)) for pattern in patterns]

    def to_dict(self, data: OrderedDict) -> dict:
        """OrderedDictを標準のdictに変換する"""
        return json.loads(json.dumps(data, ensure_ascii=False))

    def create_labs(self, course: 'Course') -> 'List[Lab]':
        with disable_signal(signals.post_save, update_rank_summary_when_capacity_changed, sender=Lab):
            labs = [Lab.objects.create(**lab_data, course=course) for lab_data in self.lab_data_set]
        return labs

    def submit_ranks(self, labs: "List[Lab]", user) -> 'List[Rank]':
        ranks = []
        for i, lab in enumerate(labs):
            rank, _ = Rank.objects.update_or_create(
                course=lab.course, user=user, order=i, defaults={'lab': lab}
            )
            ranks.append(rank)
        return ranks

    def create_rank_order(self, labs: 'List[Lab]') -> 'List[Dict[str, int]]':
        return [{'lab': lab.pk for lab in labs}]

    def update_config(self, config: 'Config', pattern: 'Dict[str, Union[bool, int]]'):
        for k in self.config_keys:
            if k in pattern:
                setattr(config, k, pattern.get(k))
        config.save()
        return config


class JWTAuthMixin(object):
    auth_header = 'JWT'

    def _set_credentials(self, user=None):
        if not user:
            user = self.user
        token = RefreshToken.for_user(user)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"{self.auth_header} {text_type(token.access_token)}"
        )

    def _unset_credentials(self):
        self.client.credentials()

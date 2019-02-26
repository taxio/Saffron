import itertools
from collections import ChainMap

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from courses.models import Course
from courses.status import Status, StatusMessage
from courses.tests.base import DatasetMixin, JWTAuthMixin

User = get_user_model()


class RequirementStatusViewTest(DatasetMixin, JWTAuthMixin, APITestCase):

    @classmethod
    def setUpClass(cls):
        super(RequirementStatusViewTest, cls).setUpClass()
        show_gpa_patterns = [True, False]
        show_username_patterns = [True, False]
        rank_limit_patterns = [3]

        config_keys = ['show_gpa', 'show_username', 'rank_limit']
        _config_patterns = list(itertools.product(show_gpa_patterns, show_username_patterns, rank_limit_patterns))
        cls.config_patterns = [dict(zip(config_keys, pattern)) for pattern in _config_patterns]
        gpa_patterns = [{"gpa": 2.0, "ok": True}, {"gpa": None, "ok": False}]
        username_patterns = [{"screen_name": "hoge", "ok": True}, {"screen_name": None, "ok": False}]
        rank_submit_patterns = [{"rank": 3, "ok": True}, {"rank": None, "ok": False}]
        cls.user_status_patterns = list(itertools.product(gpa_patterns, username_patterns, rank_submit_patterns))
        cls.all_patterns = []
        for config_pattern, user_status_pattern in list(itertools.product(cls.config_patterns, cls.user_status_patterns)):
            expected = True
            for c, u in zip(config_pattern.values(), user_status_pattern):
                expected &= True if not c else u['ok']
            combined = dict(**ChainMap(*user_status_pattern))
            combined['ok'] = expected
            cls.all_patterns.append((config_pattern, combined))

    def setUp(self):
        super(RequirementStatusViewTest, self).setUp()
        self.user = User.objects.create_user(**self.user_data_set[0], is_active=True)
        self._set_credentials()
        self.course_data = self.course_data_set[0]
        self.pin_code = self.course_data['pin_code']
        self.course = Course.objects.create_course(**self.course_data)
        self.labs = self.create_labs(self.course)

    def test_all_patterns(self):
        """ユーザの状態と設定の全ての場合を網羅する"""
        self.course.join(self.user, self.pin_code)
        for pattern in self.all_patterns:
            with self.subTest(pattern=pattern):
                config_pattern, user_pattern = pattern
                for k, v in config_pattern.items():
                    setattr(self.course.config, k, v)
                self.course.config.save()
                for k in ["gpa", "screen_name"]:
                    setattr(self.user, k, user_pattern[k])
                if user_pattern['rank'] is not None:
                    self.submit_ranks(self.labs, self.user)
                else:
                    self.user.rank_set.all().delete()
                self.user.save(update_fields=["gpa", "screen_name"])
                resp = self.client.get(f'/courses/{self.course.pk}/status/', format='json')
                self.assertEqual(200, resp.status_code)
                self.assertEqual(Status.OK if user_pattern['ok'] else Status.NG, resp.data['status'])

    def test_no_course_joined(self):
        resp = self.client.get(f'/courses/{self.course.pk}/status/', format='json')
        expected = {
            'status': Status.PENDING,
            'status_message': StatusMessage.default_messages[Status.PENDING],
            'detail': {
                'gpa': False,
                'screen_name': False,
                'rank_submitted': False
            }
        }
        self.assertEqual(200, resp.status_code)
        self.assertEqual(expected, self.to_dict(resp.data))

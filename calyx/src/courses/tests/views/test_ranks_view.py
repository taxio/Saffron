from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from courses.models import Course, Lab, Rank
from courses.tests.base import DatasetMixin, JWTAuthMixin

User = get_user_model()


class RankViewTest(DatasetMixin, JWTAuthMixin, APITestCase):

    def setUp(self):
        super(RankViewTest, self).setUp()
        self.user = User.objects.create_user(**self.user_data_set[0], is_active=True)
        self._set_credentials()
        self.course_data = self.course_data_set[0]
        self.pin_code = self.course_data['pin_code']
        self.course = Course.objects.create_course(**self.course_data)
        self.labs = [Lab.objects.create(**lab, course=self.course) for lab in self.lab_data_set]

    def test_create_rank(self):
        """POST /courses/<course_pk>/ranks/"""
        self.course.join(self.user, self.pin_code)
        expected = [{'lab': lab.pk} for lab in self.labs]
        resp = self.client.post(f'/courses/{self.course.pk}/ranks/', data=expected, format='json')
        with self.subTest(expected=expected):
            self.assertEqual(201, resp.status_code)
            self.assertEqual(expected, self.to_dict(resp.data))
        ranks = Rank.objects.filter(course=self.course, user=self.user).all()
        for i, lab in enumerate(self.labs):
            with self.subTest(order=i, lab=lab):
                self.assertTrue(ranks.filter(lab=lab, order=i).exists())
        # 数が少ない
        with self.subTest(data=expected[1:]):
            resp = self.client.post(f'/courses/{self.course.pk}/ranks/', data=expected[1:], format='json')
            self.assertEqual(400, resp.status_code)
        # 数が多い
        with self.subTest(data=expected+expected):
            resp = self.client.post(f'/courses/{self.course.pk}/ranks/', data=expected + expected, format='json')
            self.assertEqual(400, resp.status_code)
        # 存在しない研究室
        expected[0]['lab'] = 0
        with self.subTest(data=expected):
            resp = self.client.post(f'/courses/{self.course.pk}/ranks/', data=expected, format='json')
            self.assertEqual(400, resp.status_code)
        # 存在しない課程
        with self.subTest(course=9999):
            resp = self.client.post(f'/courses/9999/ranks/', data=expected, format='json')
            self.assertEqual(404, resp.status_code)

    def test_update_rank(self):
        """POST /courses/<course_pk>/ranks/"""
        self.course.join(self.user, self.pin_code)
        self.submit_ranks(self.labs, self.user)
        # 逆順にして更新する
        expected = [{'lab': lab.pk} for lab in self.labs][::-1]
        with self.subTest(data=expected):
            resp = self.client.post(f'/courses/{self.course.pk}/ranks/', data=expected, format='json')
            self.assertEqual(201, resp.status_code)
            self.assertEqual(expected, self.to_dict(resp.data))
        ranks = Rank.objects.filter(course=self.course, user=self.user).all()
        for i, lab in enumerate(self.labs[::-1]):
            with self.subTest(order=i, lab=lab):
                self.assertTrue(ranks.filter(lab=lab, order=i).exists())

    def test_create_rank_permission(self):
        """POST /courses/<course_pk>/ranks/"""
        expected = [{'lab': lab.pk} for lab in self.labs]
        # ログインしていない
        with self.subTest(logged_in=False, is_member=False):
            self._unset_credentials()
            resp = self.client.post(f'/courses/{self.course.pk}/ranks/', data=expected, format='json')
            self.assertEqual(401, resp.status_code)
        self._set_credentials()
        # メンバーで無い
        with self.subTest(logged_in=True, is_member=False):
            resp = self.client.post(f'/courses/{self.course.pk}/ranks/', data=expected, format='json')
            self.assertEqual(403, resp.status_code)

    def test_get_ranks(self):
        """GET /courses/<course_pk>/ranks/"""
        self.course.join(self.user, self.pin_code)
        resp = self.client.get(f'/courses/{self.course.pk}/ranks/')
        with self.subTest(status=200, expected=[]):
            self.assertEqual(200, resp.status_code)
            self.assertEqual([], self.to_dict(resp.data))
        ranks = [
            Rank.objects.create(
                course=self.course, user=self.user, lab=lab, order=i
            ) for i, lab in enumerate(self.labs)
        ]
        expected = [
            {
                "pk": rank.lab.pk,
                "name": rank.lab.name,
                "capacity": rank.lab.capacity
            } for rank in ranks
        ]
        expected_user_data = {
            "pk": self.user.pk,
            "username": self.user.username,
            "email": self.user.email,
        }
        for i in range(len(ranks)):
            expected[i]['rank_set'] = [[], [], []]
            expected[i]['rank_set'][i].append(expected_user_data)
        resp = self.client.get(f'/courses/{self.course.pk}/ranks/')
        with self.subTest(status=200, expected=expected):
            self.assertEqual(200, resp.status_code)
            self.assertEqual(expected, self.to_dict(resp.data))
        # 存在しない課程
        with self.subTest(status=404, expected=None):
            resp = self.client.get(f'/courses/9999/ranks/')
            self.assertEqual(404, resp.status_code)

    def test_get_rank_permission(self):
        """GET /courses/<course_pk>/ranks/"""
        # ログインしていない
        with self.subTest(logged_in=False, is_member=False):
            self._unset_credentials()
            resp = self.client.get(f'/courses/{self.course.pk}/ranks/')
            self.assertEqual(401, resp.status_code)
        with self.subTest(logged_in=True, is_member=False):
            self._set_credentials()
            # メンバーでない
            resp = self.client.get(f'/courses/{self.course.pk}/ranks/')
            self.assertEqual(403, resp.status_code)

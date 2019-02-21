from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from courses.models import Course, Lab
from courses.tests.base import DatasetMixin, JWTAuthMixin

User = get_user_model()


class LabViewTest(DatasetMixin, JWTAuthMixin, APITestCase):

    def setUp(self):
        super(LabViewTest, self).setUp()
        self.user = User.objects.create_user(**self.user_data_set[0], is_active=True)
        self._set_credentials()
        self.course_data = self.course_data_set[0]
        self.pin_code = self.course_data['pin_code']
        self.course = Course.objects.create_course(**self.course_data)

    def test_list_labs(self):
        """GET /courses/<course_pk>/labs/"""
        course = self.course
        course.join(self.user, self.pin_code)
        resp = self.client.get(f'/courses/{course.pk}/labs/', format='json')
        expected = []
        with self.subTest(status=200, expected=expected):
            self.assertEqual(200, resp.status_code)
            self.assertEqual(expected, self.to_dict(resp.data))
        lab = Lab.objects.create(**self.lab_data_set[0], course=course)
        expected = [{
            "pk": lab.pk,
            "name": lab.name,
            "capacity": lab.capacity
        }]
        resp = self.client.get(f'/courses/{course.pk}/labs/', format='json')
        with self.subTest(status=200, expected=expected):
            self.assertEqual(200, resp.status_code)
            self.assertEqual(expected, self.to_dict(resp.data))

    def test_retrieve_lab(self):
        """GET /courses/<course_pk>/labs/<lab_pk>/"""
        course = self.course
        course.join(self.user, self.pin_code)
        labs = self.create_labs(course)
        ranks = self.submit_ranks(labs, self.user)
        resp = self.client.get(f'/courses/{course.pk}/labs/9999/', format='json')
        self.assertEqual(404, resp.status_code)
        for rank in ranks:
            lab = rank.lab
            expected = {
                "pk": lab.pk,
                "name": lab.name,
                "capacity": lab.capacity,
                'rank_set': [[], [], []]
            }
            expected['rank_set'][rank.order] = [{
                'pk': self.user.pk,
                'username': self.user.username,
                'email': self.user.email
            }]
            resp = self.client.get(f'/courses/{course.pk}/labs/{lab.pk}/', format='json')
            with self.subTest(status=200, expected=expected):
                self.assertEqual(200, resp.status_code)
                self.assertEqual(expected, self.to_dict(resp.data))

    def test_create_lab(self):
        """POST /courses/<course_pk>/labs/"""
        course = self.course
        course.join(self.user, self.pin_code)
        course.register_as_admin(self.user)
        resp = self.client.post(f'/courses/{course.pk}/labs/', data=self.lab_data_set[0:1], format='json')
        self.assertEqual(201, resp.status_code)
        data = self.to_dict(resp.data)
        data[0].pop('pk')
        self.assertEqual(self.lab_data_set[0:1], data)

    def test_update_lab(self):
        """PUT /courses/<course_pk>/labs/<lab_pk>/"""
        course = self.course
        course.join(self.user, self.pin_code)
        course.register_as_admin(self.user)
        lab = Lab.objects.create(**self.lab_data_set[0], course=course)
        resp = self.client.put(f'/courses/{course.pk}/labs/{lab.pk}/', data=self.lab_data_set[1], format='json')
        self.lab_data_set[1]['pk'] = lab.pk
        self.lab_data_set[1]['rank_set'] = [[], [], []]
        with self.subTest(status=200, expected=self.lab_data_set[1]):
            self.assertEqual(200, resp.status_code)
            self.assertEqual(self.lab_data_set[1], self.to_dict(resp.data))
        resp = self.client.put(f'/courses/{course.pk}/labs/9999/', data=self.lab_data_set[1], format='json')
        with self.subTest(status=404, expected=None):
            self.assertEqual(404, resp.status_code)

    def test_delete_lab(self):
        """DELETE /courses/<course_pk>/labs/<lab_pk>/"""
        course = self.course
        course.join(self.user, self.pin_code)
        course.register_as_admin(self.user)
        lab = Lab.objects.create(**self.lab_data_set[0], course=course)
        resp = self.client.delete(f'/courses/{course.pk}/labs/{lab.pk}/', format='json')
        self.assertEqual(204, resp.status_code)
        with self.assertRaises(Lab.DoesNotExist):
            Lab.objects.get(pk=lab.pk)

    def test_get_lab_permission(self):
        course = self.course
        Lab.objects.create(**self.lab_data_set[0], course=course)
        # ログインしていない
        self._unset_credentials()
        resp = self.client.get(f'/courses/{course.pk}/labs/', format='json')
        with self.subTest(logged_in=False, is_member=False):
            self.assertEqual(401, resp.status_code)
        self._set_credentials()
        # メンバーでない
        resp = self.client.get(f'/courses/{course.pk}/labs/', format='json')
        with self.subTest(logged_in=True, is_member=False):
            self.assertEqual(403, resp.status_code)

    def test_create_lab_permission(self):
        course = self.course
        # ログインしていない
        self._unset_credentials()
        resp = self.client.post(f'/courses/{course.pk}/labs/', data=self.lab_data_set[0], format='json')
        with self.subTest(logged_in=False, is_member=False, is_admin=False):
            self.assertEqual(401, resp.status_code)
        self._set_credentials()
        # メンバーでない
        resp = self.client.post(f'/courses/{course.pk}/labs/', data=self.lab_data_set[0], format='json')
        with self.subTest(logged_in=True, is_member=False, is_admin=False):
            self.assertEqual(403, resp.status_code)
        # 管理者で無い
        course.join(self.user, self.pin_code)
        resp = self.client.post(f'/courses/{course.pk}/labs/', data=self.lab_data_set[0], format='json')
        with self.subTest(logged_in=True, is_member=True, is_admin=False):
            self.assertEqual(403, resp.status_code)

    def test_update_lab_permission(self):
        course = self.course
        lab = Lab.objects.create(**self.lab_data_set[0], course=course)
        # ログインしていない
        self._unset_credentials()
        resp = self.client.patch(f'/courses/{course.pk}/labs/{lab.pk}/', data=self.lab_data_set[1], format='json')
        with self.subTest(logged_in=False, is_member=False, is_admin=False):
            self.assertEqual(401, resp.status_code)
        self._set_credentials()
        # メンバーでない
        resp = self.client.patch(f'/courses/{course.pk}/labs/{lab.pk}/', data=self.lab_data_set[1], format='json')
        with self.subTest(logged_in=True, is_member=False, is_admin=False):
            self.assertEqual(403, resp.status_code)
        # 管理者で無い
        course.join(self.user, self.pin_code)
        resp = self.client.patch(f'/courses/{course.pk}/labs/{lab.pk}/', data=self.lab_data_set[1], format='json')
        with self.subTest(logged_in=False, is_member=False, is_admin=False):
            self.assertEqual(403, resp.status_code)

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from courses.models import Course, Lab
from courses.tests.base import DatasetMixin, JWTAuthMixin

User = get_user_model()


class ConfigViewTest(DatasetMixin, JWTAuthMixin, APITestCase):

    def setUp(self):
        super(ConfigViewTest, self).setUp()
        self.user = User.objects.create_user(**self.user_data_set[0], is_active=True)
        self._set_credentials()

    def test_get_config(self):
        """GET /courses/<course_pk>/config/"""
        course_data = self.course_data_set[0]
        pin_code = course_data['pin_code']
        course = Course.objects.create_course(**course_data)
        course.join(self.user, pin_code)
        resp = self.client.get(f'/courses/{course.pk}/config/', data={}, format='json')
        self.assertEqual(200, resp.status_code)
        self.assertEqual(self.default_config, self.to_dict(resp.data))

    def test_update_config(self):
        """POST /courses/<course_pk>/config/"""
        course_data = self.course_data_set[0]
        pin_code = course_data['pin_code']
        course = Course.objects.create_course(**course_data)
        course.join(self.user, pin_code)
        course.register_as_admin(self.user)
        self.default_config['show_gpa'] = True
        resp = self.client.post(f'/courses/{course.pk}/config/', data=self.default_config, format='json')
        self.assertEqual(200, resp.status_code)
        self.assertEqual(self.default_config, self.to_dict(resp.data))

    def test_get_config_permission(self):
        """GET /courses/<course_pk>/config/"""
        course_data = self.course_data_set[0]
        course = Course.objects.create_course(**course_data)
        # ログインしていない
        self._unset_credentials()
        resp = self.client.get(f'/courses/{course.pk}/config/', data={}, format='json')
        self.assertEqual(401, resp.status_code)
        self._set_credentials()
        # メンバーで無い
        resp = self.client.get(f'/courses/{course.pk}/config/', data={}, format='json')
        self.assertEqual(403, resp.status_code)

    def test_update_config_permission(self):
        """POST /courses/<course_pk>/config/"""
        course_data = self.course_data_set[0]
        pin_code = course_data['pin_code']
        course = Course.objects.create_course(**course_data)
        expected = {
            'show_gpa': True,
            'show_username': False
        }
        # ログインしていない
        self._unset_credentials()
        resp = self.client.post(f'/courses/{course.pk}/config/', data=expected, format='json')
        self.assertEqual(401, resp.status_code)
        self._set_credentials()
        # メンバーでない
        resp = self.client.post(f'/courses/{course.pk}/config/', data=expected, format='json')
        self.assertEqual(403, resp.status_code)
        # メンバーだが管理者で無い
        course.join(self.user, pin_code)
        resp = self.client.post(f'/courses/{course.pk}/config/', data=expected, format='json')
        self.assertEqual(403, resp.status_code)


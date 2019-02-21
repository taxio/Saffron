from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from courses.models import Course
from courses.tests.base import DatasetMixin, JWTAuthMixin

User = get_user_model()


class CourseAdminViewTest(DatasetMixin, JWTAuthMixin, APITestCase):

    def setUp(self):
        super(CourseAdminViewTest, self).setUp()
        self.user = User.objects.create_user(**self.user_data_set[0], is_active=True)
        self._set_credentials()

    def test_register_admin_put(self):
        """PUT /course/<course_pk>/admins/<pk>/"""
        course_data = self.course_data_set[0]
        pin_code = course_data['pin_code']
        course = Course.objects.create_course(**course_data)
        course.join(self.user, pin_code)
        course.register_as_admin(self.user)
        new_user = User.objects.create_user(**self.user_data_set[1], is_active=True)
        course.join(new_user, pin_code)
        resp = self.client.put(f'/courses/{course.pk}/admins/{new_user.pk}/', data={}, format='json')
        expected = {
            "pk": new_user.pk,
            "username": new_user.username,
            "email": new_user.email,
            "screen_name": new_user.screen_name,
            "gpa": new_user.gpa
        }
        with self.subTest(status=200, expected=expected):
            self.assertEqual(200, resp.status_code)
            self.assertEqual(expected, self.to_dict(resp.data))
        # 登録済みのユーザを再度登録
        resp = self.client.put(f'/courses/{course.pk}/admins/{new_user.pk}/', data={}, format='json')
        with self.subTest(status=400, expected=None):
            self.assertEqual(400, resp.status_code)
        # メンバーで無いユーザを登録
        resp = self.client.put(f'/courses/{course.pk}/admins/{self.user.pk}/', data={}, format='json')
        with self.subTest(status=400, expected=None):
            self.assertEqual(400, resp.status_code)
        # 存在しないユーザを登録
        resp = self.client.put(f'/courses/{course.pk}/admins/9999/', data={}, format='json')
        with self.subTest(status=404, expected=None):
            self.assertEqual(404, resp.status_code)
        # 存在しない課程に対して実行
        resp = self.client.put(f'/courses/9999/admins/{new_user.pk}/', data={}, format='json')
        with self.subTest(status=404, expected=None):
            self.assertEqual(404, resp.status_code)

    def test_register_admin_patch(self):
        """PATCH /course/<course_pk>/admins/<pk>/"""
        course_data = self.course_data_set[0]
        pin_code = course_data['pin_code']
        course = Course.objects.create_course(**course_data)
        course.join(self.user, pin_code)
        course.register_as_admin(self.user)
        new_user = User.objects.create_user(**self.user_data_set[1], is_active=True)
        course.join(new_user, pin_code)
        resp = self.client.patch(f'/courses/{course.pk}/admins/{new_user.pk}/', data={}, format='json')
        expected = {
            "pk": new_user.pk,
            "username": new_user.username,
            "email": new_user.email,
            "screen_name": new_user.screen_name,
            "gpa": new_user.gpa
        }
        with self.subTest(status=200, expected=expected):
            self.assertEqual(200, resp.status_code)
            self.assertEqual(expected, self.to_dict(resp.data))
        # 登録済みのユーザを再度登録
        resp = self.client.patch(f'/courses/{course.pk}/admins/{new_user.pk}/', data={}, format='json')
        with self.subTest(status=400, expected=None):
            self.assertEqual(400, resp.status_code)
        # メンバーで無いユーザを登録
        resp = self.client.patch(f'/courses/{course.pk}/admins/{self.user.pk}/', data={}, format='json')
        with self.subTest(status=400, expected=None):
            self.assertEqual(400, resp.status_code)
        # 存在しないユーザを登録
        resp = self.client.patch(f'/courses/{course.pk}/admins/9999/', data={}, format='json')
        with self.subTest(status=400, expected=None):
            self.assertEqual(404, resp.status_code)
        # 存在しない課程に対して実行
        resp = self.client.patch(f'/courses/9999/admins/{new_user.pk}/', data={}, format='json')
        with self.subTest(status=400, expected=None):
            self.assertEqual(404, resp.status_code)

    def test_unregister_admin(self):
        """DELETE /courses/<course_pk>/admins/<pk>/"""
        course_data = self.course_data_set[0]
        pin_code = course_data['pin_code']
        course = Course.objects.create_course(**course_data)
        new_user = User.objects.create_user(**self.user_data_set[1], is_active=True)
        for u in [new_user, self.user]:
            course.join(u, pin_code)
            course.register_as_admin(u)
        resp = self.client.delete(f'/courses/{course.pk}/admins/{new_user.pk}/', data={}, format='json')
        with self.subTest(status=204):
            self.assertEqual(204, resp.status_code)
            self.assertEqual(False, course.admin_user_group.user_set.filter(pk=new_user.pk).exists())
        # 管理者で無いユーザを指定
        resp = self.client.delete(f'/courses/{course.pk}/admins/{new_user.pk}/', data={}, format='json')
        with self.subTest(status=400):
            self.assertEqual(400, resp.status_code)
        # 自分自身を指定
        resp = self.client.delete(f'/courses/{course.pk}/admins/{self.user.pk}/', data={}, format='json')
        with self.subTest(status=400):
            self.assertEqual(400, resp.status_code)
        # 存在しないユーザを指定
        resp = self.client.delete(f'/courses/{course.pk}/admins/9999/', data={}, format='json')
        with self.subTest(status=404):
            self.assertEqual(404, resp.status_code)
        # 存在しない課程に対して実行
        resp = self.client.delete(f'/courses/9999/admins/{new_user.pk}/', data={}, format='json')
        with self.subTest(status=404):
            self.assertEqual(404, resp.status_code)

    def test_register_admin_get_permission(self):
        """GET /courses/<course_pk>/admins/"""
        course_data = self.course_data_set[0]
        pin_code = course_data['pin_code']
        course = Course.objects.create_course(**course_data)
        # ログインしていなければ見れない
        self._unset_credentials()
        resp = self.client.get(f'/courses/{course.pk}/admins/', data={}, format='json')
        with self.subTest(status=401, expected=None):
            self.assertEqual(401, resp.status_code)
        self._set_credentials()
        # メンバーでなければ見れない
        resp = self.client.get(f'/courses/{course.pk}/admins/', data={}, format='json')
        with self.subTest(status=403, expected=None):
            self.assertEqual(403, resp.status_code)
        # メンバーになると閲覧可
        course.join(self.user, pin_code)
        resp = self.client.get(f'/courses/{course.pk}/admins/', data={}, format='json')
        expected = []
        with self.subTest(status=200, expected=expected):
            self.assertEqual(200, resp.status_code)
            self.assertEqual(expected, self.to_dict(resp.data))

    def test_register_admin_update_permission(self):
        """PUT /courses/<course_pk>/admins/<pk>/"""
        course_data = self.course_data_set[0]
        pin_code = course_data['pin_code']
        course = Course.objects.create_course(**course_data)
        # メンバーでも管理者でもない
        new_user = User.objects.create_user(**self.user_data_set[1], is_active=True)
        course.join(new_user, pin_code)
        resp = self.client.put(f'/courses/{course.pk}/admins/{new_user.pk}/', data={}, format='json')
        with self.subTest(status=403):
            self.assertEqual(403, resp.status_code)
        # メンバーだが管理者ではない
        course.join(self.user, pin_code)
        resp = self.client.put(f'/courses/{course.pk}/admins/{new_user.pk}/', data={}, format='json')
        with self.subTest(status=403):
            self.assertEqual(403, resp.status_code)

    def test_unregister_admin_permission(self):
        """DELETE /courses/<course_pk>/admins/<pk>/"""
        course_data = self.course_data_set[0]
        pin_code = course_data['pin_code']
        course = Course.objects.create_course(**course_data)
        new_user = User.objects.create_user(**self.user_data_set[1], is_active=True)
        course.join(new_user, pin_code)
        course.register_as_admin(new_user)
        # ログインしていない
        self._unset_credentials()
        resp = self.client.delete(f'/courses/{course.pk}/admins/{new_user.pk}/', data={}, format='json')
        with self.subTest(status=401):
            self.assertEqual(401, resp.status_code)
        self._set_credentials()
        # メンバーでも管理者でもない
        resp = self.client.put(f'/courses/{course.pk}/admins/{new_user.pk}/', data={}, format='json')
        with self.subTest(status=403):
            self.assertEqual(403, resp.status_code)
        # メンバーだが管理者ではない
        course.join(self.user, pin_code)
        resp = self.client.put(f'/courses/{course.pk}/admins/{new_user.pk}/', data={}, format='json')
        with self.subTest(status=403):
            self.assertEqual(403, resp.status_code)

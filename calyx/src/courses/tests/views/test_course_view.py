from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from courses.models import Course
from courses.tests.base import DatasetMixin, JWTAuthMixin

User = get_user_model()


class CourseViewSetsTest(DatasetMixin, JWTAuthMixin, APITestCase):

    def setUp(self):
        super(CourseViewSetsTest, self).setUp()
        self.user = User.objects.create_user(**self.user_data_set[0], is_active=True)
        self._set_credentials()

    def test_list(self):
        """GET /course/"""
        course = Course.objects.create_course(**self.course_data_set[0])
        expected_json = [
            {
                "pk": course.pk,
                "name": course.name,
                "year": course.year.year,
            }
        ]
        resp = self.client.get('/courses/', data={}, format='json')
        self.assertEqual(200, resp.status_code)
        self.assertEqual(expected_json, self.to_dict(resp.data))

    def test_post(self):
        """POST /course/"""
        # データの作成
        course_data = self.course_data_set[0]
        resp = self.client.post('/courses/', data=course_data, format='json')
        expected_json = {
            'name': course_data['name'],
            'year': course_data.get('year'),
            'users': [
                {
                    "pk": self.user.pk,
                    "username": self.user.username,
                    "is_admin": True
                }
            ],
            'config': self.default_config,
            'is_admin': True
        }
        with self.subTest(status=201, expected=expected_json, with_config=False):
            self.assertEqual(201, resp.status_code)
            actual = self.to_dict(resp.data)
            course_pk = actual.pop("pk")
            self.assertEqual(expected_json, actual)
        Course.objects.get(pk=course_pk).delete()
        # configと一緒にPOSTする
        new_config = self.default_config
        new_config['show_gpa'] = True
        course_with_config = course_data
        course_with_config['config'] = new_config
        expected_json['config'] = new_config
        resp = self.client.post('/courses/', data=course_with_config, format='json')
        actual = self.to_dict(resp.data)
        actual.pop('pk')
        with self.subTest(status=201, expected=expected_json, with_config=True):
            self.assertEqual(201, resp.status_code)
            self.assertEqual(expected_json, actual)
        # PINコード無し
        course_data.pop('pin_code')
        resp = self.client.post('/courses/', data=course_data, format='json')
        with self.subTest(status=400, expected=None):
            self.assertEqual(400, resp.status_code)
        # PINコードが短すぎ
        course_data['pin_code'] = '0'
        resp = self.client.post('/courses/', data=course_data, format='json')
        with self.subTest(status=400, expected=None):
            self.assertEqual(400, resp.status_code)

    def test_retrieve(self):
        """GET /course/<pk>/"""
        course_data = self.course_data_set[0]
        course = Course.objects.create_course(**course_data)
        # 参加しているユーザは閲覧できる
        course.join(self.user, course_data['pin_code'])
        resp = self.client.get(f'/courses/{course.pk}/', data={}, format='json')
        expected_json = {
            'pk': course.pk,
            'name': course.name,
            'year': course.year.year,
            'users': [
                {
                    'pk': self.user.pk,
                    'username': self.user.username,
                    'is_admin': False
                }
            ],
            'config': self.default_config,
            'is_admin': False
        }
        self.assertEqual(200, resp.status_code)
        self.assertEqual(expected_json, self.to_dict(resp.data))

    def test_retrieve_permissions(self):
        """GET /courses/<pk>/"""
        course_data = self.course_data_set[0]
        course = Course.objects.create_course(**course_data)
        # ログインしていなければ詳細を閲覧できない
        self._unset_credentials()
        resp = self.client.get(f'/courses/{course.pk}/', data={}, format='json')
        with self.subTest(status=401, expected=None):
            self.assertEqual(401, resp.status_code)
        self._set_credentials()
        # 参加していないユーザは詳細を閲覧できない
        resp = self.client.get(f'/courses/{course.pk}/', data={}, format='json')
        with self.subTest(status=403, expected=None):
            self.assertEqual(403, resp.status_code)

    def test_retrieve_permission_gpa(self):
        """GET /courses/<pk>/"""
        course_data = self.course_data_set[0]
        course = Course.objects.create_course(**course_data)
        # 課程へ加入
        course.join(self.user, course_data['pin_code'])
        # GPA必須の場合，未入力では閲覧できない
        course.config.show_gpa = True
        course.config.save()
        self.user.gpa = None
        self.user.save()
        resp = self.client.get(f'/courses/{course.pk}/', data={}, format='json')
        with self.subTest(status=403, expected=None):
            self.assertEqual(403, resp.status_code)
        # GPAを入力すれば閲覧できる
        self.user.gpa = 2.0
        self.user.save()
        resp = self.client.get(f'/courses/{course.pk}/', data={}, format='json')
        with self.subTest(status=200, expected=None):
            self.assertEqual(200, resp.status_code)

    def test_retrieve_permission_username(self):
        """GET /courses/<pk>/"""
        course_data = self.course_data_set[0]
        course = Course.objects.create_course(**course_data)
        # 課程へ加入
        course.join(self.user, course_data['pin_code'])
        # screen_name必須の場合，未入力では閲覧できない
        course.config.show_username = True
        course.config.save()
        self.user.screen_name = None
        self.user.save()
        resp = self.client.get(f'/courses/{course.pk}/', data={}, format='json')
        with self.subTest(status=403, expected=None):
            self.assertEqual(403, resp.status_code)
        # GPAを入力すれば閲覧できる
        self.user.screen_name = 'test_user'
        self.user.save()
        resp = self.client.get(f'/courses/{course.pk}/', data={}, format='json')
        with self.subTest(status=200, expected=None):
            self.assertEqual(200, resp.status_code)

    def test_patch(self):
        """PATCH /courses/<pk>/"""
        course_data = self.course_data_set[0]
        course = Course.objects.create_course(**course_data)
        course.join(self.user, course_data['pin_code'])
        updated_name = 'updated'
        new_config = self.default_config
        new_config['show_gpa'] = True
        expected_json = {
            'pk': course.pk,
            'name': updated_name,
            'year': course.year.year,
            'users': [
                {
                    'pk': self.user.pk,
                    'username': self.user.username,
                    'is_admin': True
                }
            ],
            'config': new_config,
            'is_admin': True
        }
        # 標準メンバーは更新できない
        resp = self.client.patch(f'/courses/{course.pk}/', data=expected_json, format='json')
        with self.subTest(status=403, expected=None, is_admin=False):
            self.assertEqual(403, resp.status_code)
        # 管理者は更新できる
        course.register_as_admin(self.user)
        self._set_credentials(self.user)
        resp = self.client.patch(f'/courses/{course.pk}/', data=expected_json, format='json')
        with self.subTest(status=200, expected=expected_json, is_admin=True):
            self.assertEqual(200, resp.status_code)
            self.assertEqual(expected_json, self.to_dict(resp.data))

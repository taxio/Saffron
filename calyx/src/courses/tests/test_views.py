from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework_jwt.settings import api_settings
from courses.models import Course
from .base import DatasetMixin

User = get_user_model()


class CourseViewSetsTest(DatasetMixin, APITestCase):

    def _set_credentials(self, user=None):
        if not user:
            user = self.user
        jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
        jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER
        payload = jwt_payload_handler(user)
        token = jwt_encode_handler(payload)
        self.client.credentials(HTTP_AUTHORIZATION="JWT " + token)

    def setUp(self):
        super(CourseViewSetsTest, self).setUp()
        self.user = User.objects.create_user(**self.user_data_set[0], is_active=True)
        self._set_credentials()

    def test_list(self):
        """GET /course/"""
        course = Course.objects.create_course(**self.course_data_set[0])
        course.join(self.user, self.course_data_set[0]['pin_code'])
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
            ]
        }
        self.assertEqual(201, resp.status_code)
        actual = self.to_dict(resp.data)
        actual.pop("pk")
        self.assertEqual(expected_json, actual)
        # PINコード無し
        course_data.pop('pin_code')
        resp = self.client.post('/courses/', data=course_data, format='json')
        self.assertEqual(400, resp.status_code)
        # PINコードが短すぎ
        course_data['pin_code'] = '0'
        resp = self.client.post('/courses/', data=course_data, format='json')
        self.assertEqual(400, resp.status_code)

    def test_retrieve(self):
        """GET /course/<pk>/"""
        course_data = self.course_data_set[0]
        course = Course.objects.create_course(**course_data)
        # 参加していないユーザは詳細を閲覧できない
        resp = self.client.get(f'/courses/{course.pk}/', data={}, format='json')
        self.assertEqual(403, resp.status_code)
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
            ]
        }
        self.assertEqual(200, resp.status_code)
        self.assertEqual(expected_json, self.to_dict(resp.data))

    def test_patch(self):
        """PATCH /courses/<pk>/"""
        course_data = self.course_data_set[0]
        course = Course.objects.create_course(**course_data)
        course.join(self.user, course_data['pin_code'])
        updated_name = 'updated'
        course_data['name'] = updated_name
        # 標準メンバーは更新できない
        resp = self.client.patch(f'/courses/{course.pk}/', data=course_data, format='json')
        self.assertEqual(403, resp.status_code)
        # 管理者は更新できる
        course.register_as_admin(self.user)
        self._set_credentials(self.user)
        resp = self.client.patch(f'/courses/{course.pk}/', data=course_data, format='json')
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
            ]
        }
        self.assertEqual(200, resp.status_code)
        self.assertEqual(expected_json, self.to_dict(resp.data))

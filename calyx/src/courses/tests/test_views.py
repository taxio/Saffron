from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from courses.models import Course
from .base import DatasetMixin, JWTAuthMixin

User = get_user_model()


class CourseViewSetsTest(DatasetMixin, JWTAuthMixin, APITestCase):

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
            ],
            'is_admin': True
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
        # ログインしていなければ詳細を閲覧できない
        self._unset_credentials()
        resp = self.client.get(f'/courses/{course.pk}/', data={}, format='json')
        self.assertEqual(401, resp.status_code)
        self._set_credentials()
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
            ],
            'is_admin': False
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
            ],
            'is_admin': True
        }
        self.assertEqual(200, resp.status_code)
        self.assertEqual(expected_json, self.to_dict(resp.data))


class YearViewSetsTest(DatasetMixin, JWTAuthMixin, APITestCase):

    def setUp(self):
        super(YearViewSetsTest, self).setUp()
        self.user = User.objects.create_user(**self.user_data_set[0], is_active=True)
        self._set_credentials()

    def test_list(self):
        courses = list()
        for course_data in self.course_data_set:
            course_data.setdefault('year', 2018)
            courses.append(Course.objects.create_course(**course_data))
        resp = self.client.get('/years/', format='json')
        expected_json = [
            {
                "pk": courses[0].year.pk,
                "year": 2018,
                "courses": [
                    {
                        "pk": course.pk,
                        "name": course.name,
                        "year": 2018
                    } for course in courses
                ]
            }
        ]
        self.assertEqual(200, resp.status_code)
        self.assertEqual(expected_json, self.to_dict(resp.data))
        # ログインしていなければ見れない
        self.client.credentials(HTTP_AUTHORIZATION="")
        resp = self.client.get('/years/', format='json')
        self.assertEqual(401, resp.status_code)


class JoinViewTest(DatasetMixin, JWTAuthMixin, APITestCase):

    def setUp(self):
        super(JoinViewTest, self).setUp()
        self.user = User.objects.create_user(**self.user_data_set[0], is_active=True)
        self._set_credentials()

    def test_join(self):
        """POST /courses/<pk>/join/"""
        course_data = self.course_data_set[0]
        course = Course.objects.create_course(**course_data)
        payload = {'pin_code': course_data['pin_code']}
        resp = self.client.post(f'/courses/{course.pk}/join/', data=payload, format='json')
        expected = {
            'pk': course.pk,
            'name': course.name,
            'year': course.year.year,
            'users': [
                {
                    "pk": self.user.pk,
                    "username": self.user.username,
                    "is_admin": False
                }
            ]
        }
        self.assertEqual(201, resp.status_code)
        self.assertEqual(expected, self.to_dict(resp.data))
        # 同じユーザの二度目の加入はエラー
        resp = self.client.post(f'/courses/{course.pk}/join/', data=payload, format='json')
        self.assertEqual(400, resp.status_code)

    def test_join_with_invalid_pin_code(self):
        """POST /couses/<pk>/join/"""
        course_data = self.course_data_set[0]
        course = Course.objects.create_course(**course_data)
        # 間違ったPINコードで参加
        payload = {'pin_code': 'invalid_code'}
        resp = self.client.post(f'/courses/{course.pk}/join/', data=payload, format='json')
        self.assertEqual(400, resp.status_code)
        # 存在しない課程に対してジョイン
        resp = self.client.post('/courses/9999/join/', data=payload, format='json')
        self.assertEqual(404, resp.status_code)

    def test_join_permission(self):
        """POST /courses/<pk>/join/"""
        course_data = self.course_data_set[0]
        course = Course.objects.create_course(**course_data)
        payload = {'pin_code': course_data['pin_code']}
        # ログインしていなければ参加できない
        self._unset_credentials()
        resp = self.client.post(f'/courses/{course.pk}/join/', data=payload, format='json')
        self.assertEqual(401, resp.status_code)

from django.test import TestCase
from courses.models import Course, Year
from courses.serializers import YearSerializer
from .base import DatasetMixin


class YearSerializerTest(DatasetMixin, TestCase):

    def test_serialize(self):
        """YearモデルのJSONへの変換"""
        year = Year.objects.create(year=self.years[0])
        serializer = YearSerializer(year)
        expected_json = {
            'pk': year.pk,
            'year': self.years[0],
            'courses': []
        }
        self.assertEqual(expected_json, serializer.data)

    def test_serialize_with_course(self):
        """Courseモデルを含むYearモデルのJSONへの変換"""
        data = self.course_data_set[0]
        course = Course.objects.create_course(**data)
        serializer = YearSerializer(course.year)
        expected_json = {
            'pk': course.year.pk,
            'year': data['year'],
            'courses': [
                {
                    'pk': course.pk,
                    'name': data['name'],
                    'year': data['year']
                }
            ]
        }
        self.assertEqual(expected_json, serializer.data)

    def test_deserialize(self):
        """JSONをYearモデルに変換"""
        for year_int in self.years:
            serializer = YearSerializer(data={'year': year_int})
            serializer.is_valid()
            serializer.save()
        self.assertEqual(len(self.years), Year.objects.count())
        for y_int, year in zip(self.years, Year.objects.order_by('year').all()):
            self.assertEqual(y_int, year.year)




from copy import deepcopy
from django.test import TestCase


years = [2017, 2018, 2019]

course_data_set = [
    {
        "name": "Course A",
        "year": 2018,
        "pin_code": "0123"
    }, {
        "name": "Course B",
        "pin_code": "aaabbbcccddd"
    }, {
        "name": "ﾎｹﾞ",
        "year": 2018,
        "pin_code": "1234"
    }
]

user_data_set = [
    {
        "username": "b0000000",
        "password": "password"
    }, {
        "username": "m0000000",
        "password": "password"
    }
]


class DatasetMixin(object):

    def setUp(self):
        self.course_data_set = deepcopy(course_data_set)
        self.user_data_set = deepcopy(user_data_set)
        self.years = deepcopy(years)

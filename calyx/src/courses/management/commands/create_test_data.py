import random

from django.core.management import BaseCommand
from faker import Factory

from courses.models import Course, Rank, Lab, Year
from users.models import User


class Command(BaseCommand):
    years = [
        2018,
        2019
    ]

    common_pin_code = 3125

    courses = [
        {
            "name": "両方表示課程",
            "config": {
                "show_gpa": True,
                "show_username": True,
                "rank_limit": 3
            },
            "pin_code": common_pin_code
        },
        {
            "name": "GPA表示課程",
            "config": {
                "show_gpa": True,
                "show_username": False,
                "rank_limit": 3
            },
            "pin_code": common_pin_code
        },
        {
            "name": "氏名表示課程",
            "config": {
                "show_gpa": False,
                "show_username": True,
                "rank_limit": 3
            },
            "pin_code": common_pin_code
        },
        {
            "name": "デフォルト課程",
            "config": {
                "show_gpa": False,
                "show_username": False,
                "rank_limit": 3
            },
            "pin_code": common_pin_code
        }
    ]
    capacity_choices = [3, 4, 5]

    lab_count = 15

    students_count = 200

    def handle(self, *args, **options):
        fake = Factory.create('ja_JP')
        years = [Year.objects.create(year=y) for y in self.years]
        for year in years:
            grade = year.year % 2010 - 3
            students = [
                User(
                    username=f"b{grade}{i:06}",
                    email=f"b{grade}{i:06}@edu.kit.ac.jp",
                    password="studioaquatan",
                    gpa=round(random.gauss(2.5, 1.0), 2),
                    screen_name=fake.name(),
                    is_active=True
                ) for i in range(self.students_count)
            ]
            # パスワードをハッシュ化する
            for student in students:
                student.set_password(student.password)
            User.objects.bulk_create(students)
            # bulk_createではidが返ってこないので取得し直す
            students = User.objects.all()
            for student_set, course_data in zip([students[:50], students[50:100], students[100:150], students[150:200]],
                                                self.courses):
                course = Course.objects.create_course(
                    name=course_data['name'],
                    pin_code=course_data['pin_code'],
                    year=year.year,
                    config=course_data['config']
                )
                # 全員課程にjoinさせる
                for student in student_set:
                    course.join(student, self.common_pin_code)
                # ランダムに一人選んで課程のadminにする
                course.register_as_admin(random.choice(list(student_set)))
                lab_sets = [
                    Lab(
                        name=f"研究室{chr(i + 65)}",
                        course=course,
                        capacity=random.choice(self.capacity_choices)
                    ) for i in range(self.lab_count)
                ]
                Lab.objects.bulk_create(lab_sets)
                # bulk_createではidが返ってこないので取得し直す
                lab_sets = Lab.objects.filter(course=course).all()
                # 各ユーザごとにランダムに3つ選んで希望を出す
                rank_set = [
                    Rank(
                        user=student, order=i, lab=lab, course=course
                    ) for student in student_set for i, lab in enumerate(random.sample(list(lab_sets), 3))
                ]
                Rank.objects.bulk_create(rank_set)

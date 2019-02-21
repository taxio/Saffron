from django.db import IntegrityError
from django.test import TestCase

from courses.models import Course, Lab, Rank
from courses.tests.base import DatasetMixin
from users.models import User


class RankModelTest(DatasetMixin, TestCase):

    def setUp(self):
        super(RankModelTest, self).setUp()
        self.course = Course.objects.create_course(**self.course_data_set[0])
        self.labs = [Lab.objects.create(**lab_data, course=self.course) for lab_data in self.lab_data_set]
        self.users = [User.objects.create_user(**user_data, is_active=True) for user_data in self.user_data_set]

    def test_create_rank(self):
        """志望順位の作成"""
        for i, lab in enumerate(self.labs):
            Rank.objects.create(lab=lab, course=self.course, user=self.users[0], order=i + 1)
        ranks = Rank.objects.all()
        self.assertEqual(len(self.labs), len(ranks))
        user_rank_set = self.users[0].rank_set.all()
        for rank in ranks:
            self.assertTrue(rank in user_rank_set)

    def test_create_duplicate_rank(self):
        """重複して登録"""
        for i, lab in enumerate(self.labs):
            Rank.objects.create(lab=lab, course=self.course, user=self.users[0], order=i + 1)
            with self.assertRaises(IntegrityError):
                # 全て同じ
                Rank.objects.create(lab=lab, course=self.course, user=self.users[0], order=i + 1)
            with self.assertRaises(IntegrityError):
                # 同一課程，同一研究室，同一ユーザで異なる志望順位
                Rank.objects.create(lab=lab, course=self.course, user=self.users[0], order=999)

    def test_move_up_ranks(self):
        """研究室を削除して志望順位を繰り上げる"""
        ranks = list()
        for i, lab in enumerate(self.labs):
            ranks.append(Rank.objects.create(lab=lab, course=self.course, user=self.users[0], order=i + 1))
        rank_ro_del = ranks.pop(0)
        ranks.append(rank_ro_del)
        expected = [{'order': rank.order - 1, 'lab': rank.lab_id} for rank in ranks]
        expected[-1] = {'order': len(self.labs), 'lab': None}
        self.labs[0].delete()
        ranks = Rank.objects.filter(course=self.course, user=self.users[0]).order_by('order').all()
        actual = [{'order': rank.order, 'lab': rank.lab_id} for rank in ranks]
        self.assertEqual(expected, actual)

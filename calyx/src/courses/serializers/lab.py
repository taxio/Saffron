from django.contrib.auth import get_user_model
from rest_framework import serializers

from courses.models import Course, Lab
from .rank import RankPerLabSerializer

User = get_user_model()


class LabListCreateSerializer(serializers.ListSerializer):
    """
    複数の研究室を一括で作成するシリアライザ
    """

    def to_internal_value(self, data):
        course = self.context.get("course")
        for i in range(len(data)):
            data[i]['course'] = course
        return data

    def validate(self, data):
        name_set = [d['name'] for d in data]
        without_dups = list(set(name_set))
        if len(name_set) != len(without_dups):
            raise serializers.ValidationError({'name': '重複した名前は使用できません．'})
        return data

    def create(self, validated_data):
        course = self.context.get("course")
        labs = [Lab(**data) for data in validated_data]
        Lab.objects.bulk_create(labs)
        return Lab.objects.filter(course_id=course.pk).all()


class LabAbstractSerializer(serializers.ModelSerializer):
    """
    希望順位を含まない研究室のシリアライザ
    """

    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.select_related('year').all(),
                                                write_only=True, required=False)

    parent_lookup_kwargs = {
        'course_pk': 'course_id'
    }

    class Meta:
        model = Lab
        fields = ("pk", "name", "capacity", "course")
        list_serializer_class = LabListCreateSerializer


class LabSerializer(LabAbstractSerializer):
    """
    研究室のシリアライザ
    """

    rank_set = RankPerLabSerializer(many=True, read_only=True)

    parent_lookup_kwargs = {
        'course_pk': 'course_id'
    }

    class Meta:
        model = Lab
        fields = ("pk", "name", "capacity", "course", "rank_set")

    def validate_capacity(self, obj):
        if obj < 0:
            raise serializers.ValidationError({"capacity": "許容人数は0人以上である必要があります．"})
        return obj

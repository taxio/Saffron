import functools
from django.core import exceptions
from django.db import IntegrityError, models, transaction
from django.contrib.auth import get_user_model, password_validation
from django.conf import settings
from rest_framework import serializers
from .models import Course, Year, Config, Lab, Rank


User = get_user_model()


@functools.lru_cache(maxsize=None)
def get_pin_code_validators():
    return password_validation.get_password_validators(settings.PIN_CODE_VALIDATORS)


class UserSerializer(serializers.ModelSerializer):
    """
    ユーザオブジェクトのシリアライザ
    """

    # NestedViewMixinで使用される親要素のフィルタリング．
    # dirty hackっぽいが，Course一覧からプライマリキーでフィルタをかけて1つに絞り，参加するユーザ一覧を取得する
    # `course_pk`がURLパラメータのキー，`pk`が絞り込みに使用するキー
    parent_lookup_kwargs = {
        'course_pk': 'pk'
    }

    class Meta:
        model = User
        fields = ("pk", "username", "email", "screen_name")
        extra_kwargs = {
            "username": {"read_only": True},
            "email": {"read_only": True},
            "screen_name": {"read_only": True},
        }


class RankListCreateSerializer(serializers.ListSerializer):
    """希望順位をまとめて作成/更新するシリアライザ"""

    def validate(self, attrs):
        config = self.context['course'].config  # type: Config
        if len(attrs) != config.rank_limit:
            raise serializers.ValidationError(
                {'non_field_errors': f'希望順位の提出数は{config.rank_limit}個である必要があります．'}
            )
        return super(RankListCreateSerializer, self).validate(attrs)

    def create(self, validated_data):
        user = self.context['request'].user  # type: User
        course = self.context['course']  # type: Course
        rank_list = []
        with transaction.atomic():
            for i, data in enumerate(validated_data):
                rank, _ = Rank.objects.update_or_create(
                    user=user, course=course, order=i+1, defaults={'lab': data['lab']}
                )
                rank_list.append(rank)
        return rank_list


class RankCreateSerializer(serializers.ModelSerializer):
    """希望順位を作成するシリアライザ"""
    lab = serializers.PrimaryKeyRelatedField(
        queryset=Lab.objects.select_related('course').all(), required=False
    )

    class Meta:
        model = Rank
        fields = ('lab',)
        list_serializer_class = RankListCreateSerializer


class RankPerLabListSerializer(serializers.ListSerializer):
    """研究室ごとの希望順位を表示するシリアライザ"""

    def to_representation(self, data):
        """
        [[第1志望のユーザのリスト],[第2志望のユーザのリスト],...]
        :param data:
        :return:
        """
        config = self.context['course'].config  # type: Config
        iterable = data.all() if isinstance(data, models.Manager) else data
        rank_per_order = list()
        for order in range(1, config.rank_limit+1):
            rank_per_order.append(
                [self.child.to_representation(rank) for rank in iterable.filter(order=order).all()]
            )
        return rank_per_order


class RankPerLabSerializer(serializers.ModelSerializer):
    """
    希望順位のシリアライザ
    """

    user = UserSerializer(read_only=True)

    parent_lookup_kwargs = {
        'lab_pk': 'lab_id'
    }

    class Meta:
        model = Rank
        fields = ('user',)
        list_serializer_class = RankPerLabListSerializer

    def to_representation(self, instance):
        """ユーザ情報のみを返却する"""
        data = super(RankPerLabSerializer, self).to_representation(instance)
        return data['user']


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


class LabSerializer(LabAbstractSerializer):
    """
    研究室のシリアライザ
    """

    rank_set = RankPerLabSerializer(many=True, read_only=True)

    class Meta:
        model = Lab
        fields = ("pk", "name", "capacity", "course", "rank_set")

    def validate_capacity(self, obj):
        if obj < 0:
            raise serializers.ValidationError({"capacity": "許容人数は0人以上である必要があります．"})
        return obj


class ConfigSerializer(serializers.ModelSerializer):
    """
    課程ごとの表示設定のシリアライザ．
    """

    parent_lookup_kwargs = {
        'course_pk': 'course_id'
    }

    class Meta:
        model = Config
        fields = ("show_gpa", "show_username", "rank_limit")


class CourseSerializer(serializers.ModelSerializer):
    """
    課程のシリアライザ．年度はリレーション先から年度の数字のみを取得して返す．
    所属するユーザはそのプライマリキーと学生IDのみを返す．
    """

    users = serializers.SerializerMethodField(read_only=True)
    year = serializers.IntegerField(source='year.year')
    is_admin = serializers.SerializerMethodField(read_only=True)
    config = ConfigSerializer(required=False)

    class Meta:
        model = Course
        fields = ("pk", "name", "users", "pin_code", "year", "is_admin", "config")
        extra_kwargs = {
            'pin_code': {'write_only': True}
        }

    def create(self, validated_data):
        # yearは{'year': {'year': 20xx}}という辞書になっている
        validated_data['year'] = validated_data['year']['year']
        try:
            course = Course.objects.create_course(**validated_data)
            if 'request' in self.context.keys():
                course.join(self.context['request'].user, validated_data['pin_code'])
            return course
        except IntegrityError:
            raise serializers.ValidationError({'name': f'{validated_data["name"]}は既に存在しています．'})

    def update(self, instance, validated_data):
        try:
            pin_code = validated_data.pop('pin_code')
            instance.set_password(pin_code)
        except KeyError:
            pass
        # yearは{'year': {'year': 20xx}}という辞書になっている
        year = validated_data.get('year', instance.year.year)
        if isinstance(year, dict):
            year = year.get('year')
        validated_data['year'], _ = Year.objects.get_or_create(year=year)
        # configはOrderedDict
        config = validated_data.get('config', instance.config)
        if not isinstance(config, Config):
            config, _ = Config.objects.update_or_create(course=instance, defaults=config)
        validated_data['config'] = config

        for key, val in validated_data.items():
            setattr(instance, key, val)
        instance.save()
        return instance

    def validate_pin_code(self, data):
        try:
            password_validation.validate_password(data, password_validators=get_pin_code_validators())
        except exceptions.ValidationError as e:
            raise serializers.ValidationError(str(e))
        return data

    def get_users(self, obj):
        users = obj.users.prefetch_related('groups').all()
        group_name = obj.admin_group_name
        return [
            {
                'username': user.username,
                'pk': user.pk,
                'is_admin': user.groups.filter(name=group_name).exists()
            } for user in users
        ]

    def get_is_admin(self, obj):
        try:
            user = self.context['request'].user
        except KeyError:
            return False
        group_name = obj.admin_group_name
        return user.groups.filter(name=group_name).exists()


class CourseWithoutUserSerializer(serializers.ModelSerializer):
    """
    ユーザの情報を含まないCourseSerializer
    """

    year = serializers.IntegerField(source='year.year')

    class Meta:
        model = Course
        fields = ("pk", "name", "year")

    def create(self, validated_data):
        raise NotImplementedError("This method is not supported in this serializer.")

    def update(self, instance, validated_data):
        raise NotImplementedError("This method is not supported in this serializer.")


class YearSerializer(serializers.ModelSerializer):
    """
    年度の数字と課程の一覧を返す．
    """

    courses = CourseWithoutUserSerializer(many=True, read_only=True)

    class Meta:
        model = Year
        fields = ("pk", "year", "courses")


class PINCodeSerializer(serializers.Serializer):
    """
    PINコードを取得する
    """

    pin_code = serializers.CharField(required=True, write_only=True)

    class Meta:
        fields = ("pin_code",)

    def to_internal_value(self, data):
        return {'pin_code': data['pin_code']}

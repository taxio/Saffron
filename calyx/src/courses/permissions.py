from typing import TYPE_CHECKING
from django.core.cache import cache
from rest_framework import permissions

if TYPE_CHECKING:
    from typing import Optional
    from .models import Course


class IsAdmin(permissions.IsAuthenticated):
    """
    スーパーユーザならばTrue
    """

    def has_object_permission(self, request, view, obj: 'Course'):
        return request.user and request.user.is_staff


class IsCourseMember(permissions.IsAuthenticated):
    """
    課程に所属するメンバーならばTrue
    """

    def has_object_permission(self, request, view, obj: 'Course'):
        user = request.user
        if obj.users.filter(pk=user.pk).exists():
            return True
        return False


class IsCourseAdmin(permissions.IsAuthenticated):
    """
    課程の管理グループに所属するメンバーならばTrue
    """

    def has_object_permission(self, request, view, obj: 'Course'):
        user = request.user
        if user.groups.filter(name=obj.admin_group_name).exists():
            return True
        return False


class GPARequirement(permissions.IsAuthenticated):
    """GPAを入力しているかどうか．表示設定がFalseなら常にTrueが返る"""

    message = "GPAが未入力です．"

    def satisfy_requirements(self, show: bool, obj: 'Optional[str, float]') -> bool:
        if show:
            if obj is None:
                return False
        return True

    def get_config(self, obj):
        return cache.get(f'course-config-{obj.pk}')

    def has_object_permission(self, request, view, obj):
        user = request.user
        config = self.get_config(obj)
        return self.satisfy_requirements(config['show_gpa'], user.gpa)


class ScreenNameRequirement(GPARequirement):
    """screen_nameを入力しているかどうか．表示設定がFalseなら常にTrueが返る"""

    message = "表示名が未入力です．"

    def has_object_permission(self, request, view, obj):
        user = request.user
        config = self.get_config(obj)
        return self.satisfy_requirements(config['show_username'], user.screen_name)


class RankSubmitted(GPARequirement):
    """志望を提出しているかどうか"""

    message = "研究室の志望順位がまだ提出されていない，または規定の数を満たしていません．"

    def has_object_permission(self, request, view, obj):
        user = request.user
        config = self.get_config(obj)
        rank_limit = config['rank_limit']
        user_submitted = user.rank_set.filter(course=obj).count()
        if rank_limit != user_submitted:
            return False
        return True

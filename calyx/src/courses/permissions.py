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


class SatisfyCourseRequirements(permissions.IsAuthenticated):
    """
    課程の設定項目を満たしていればTrue
    """
    def has_object_permission(self, request, view, obj: 'Course'):
        user = request.user
        config = cache.get(f'course-config-{obj.pk}')
        return (
                self.satisfy_requirements(config['show_username'], user.screen_name) &
                self.satisfy_requirements(config['show_gpa'], user.gpa)
        )

    def satisfy_requirements(self, show: bool, obj: 'Optional[str, float]') -> bool:
        if show:
            if obj is None:
                return False
        return True

from typing import TYPE_CHECKING
from rest_framework import permissions

if TYPE_CHECKING:
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

from rest_framework import permissions


class IsAdmin(permissions.IsAdminUser):
    """
    スーパーユーザならばTrue
    """

    def has_object_permission(self, request, view, obj):
        return request.user and request.user.is_staff


class IsCourseMember(permissions.BasePermission):
    """
    課程に所属するメンバーならばTrue
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user
        if obj.users.filter(pk=user.pk).exists():
            return True
        return False


class IsCourseAdmin(permissions.BasePermission):
    """
    課程の管理グループに所属するメンバーならばTrue
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.groups.filter(name=obj.admin_group_name).exists():
            return True
        return False

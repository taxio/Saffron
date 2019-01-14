from rest_framework import permissions


class IsOwner(permissions.IsAuthenticated):

    def has_object_permission(self, request, view, obj):
        """本人ならば許可"""
        user = request.user
        if user is None:
            return False
        return user == obj

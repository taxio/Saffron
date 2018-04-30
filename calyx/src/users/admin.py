from django.contrib import admin
from .models import User
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserChangeForm


class MyUserChangeForm(UserChangeForm):
    """
    カスタムユーザモデルのためのフォーム
    """

    class Meta(UserChangeForm.Meta):
        model = User


class MyUserAdmin(UserAdmin):
    """
    カスタムユーザモデルをDjango amdinで扱うためのAdminモデル
    """
    list_display = (
        'username',
        'screen_name',
        'is_active',
        'course'
    )
    add_fieldsets = (
        (None, {
            'fields': (
                'username',
                'screen_name',
                'is_active',
                'is_staff',
                'is_superuser',
                'gpa',
                'password1',
                'password2',
                'course'
            )
        }),
    )
    fieldsets = (
        (None, {
            'fields': (
                'username',
                'screen_name',
                'is_active',
                'is_staff',
                'is_superuser',
                'gpa',
                'password',
                'course'
            )
        }),
    )
    ordering = ('username',)


admin.site.register(User, MyUserAdmin)

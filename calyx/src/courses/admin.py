from django.contrib import admin

from .forms import CourseForm
from .models import Course, Year, Lab, Config


class MembershipInline(admin.TabularInline):
    model = Course.users.through


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    """
    Adminページで使用するフォームの設定
    """
    form = CourseForm
    list_display = (
        'name', 'year', 'user_count', 'gpa', 'screen_name', 'lab_count'
    )
    list_filter = (
        'name',
        'year__year'
    )

    inlines = [
        MembershipInline
    ]

    def gpa(self, obj):
        """GPAを表示する"""
        return obj.config.show_gpa

    def screen_name(self, obj):
        """ユーザ名を表示する"""
        return obj.config.show_username

    def user_count(self, obj):
        """所属人数"""
        return obj.users.count()

    def lab_count(self, obj):
        """研究室数"""
        return obj.labs.count()


@admin.register(Config)
class ConfigAdmin(admin.ModelAdmin):
    list_display = ('course_name', 'show_gpa', 'show_username', 'rank_limit')

    def course_name(self, obj):
        """課程名"""
        return obj.course.name


@admin.register(Year)
class YearAdmin(admin.ModelAdmin):
    list_display = ('year', 'course_count')

    def course_count(self, obj):
        """課程数"""
        return obj.courses.count()


@admin.register(Lab)
class LabAdmin(admin.ModelAdmin):
    list_display = ('name', 'course_name', 'capacity')

    list_filter = (
        'name',
        'course__name'
    )

    def course_name(self, obj):
        return obj.course.name

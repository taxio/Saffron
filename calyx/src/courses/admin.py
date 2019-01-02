from django.contrib import admin
from .models import Course, Year
from .forms import CourseForm


class MembershipInline(admin.TabularInline):
    model = Course.users.through


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    """
    Adminページで使用するフォームの設定
    """
    form = CourseForm
    list_display = (
        'name', 'year', 'user_count'
    )
    list_filter = (
        'name',
        'year__year'
    )

    inlines = [
        MembershipInline
    ]

    def user_count(self, obj):
        return obj.users.count()


@admin.register(Year)
class YearAdmin(admin.ModelAdmin):

    list_display = ('year', 'course_count')

    def course_count(self, obj):
        return obj.courses.count()

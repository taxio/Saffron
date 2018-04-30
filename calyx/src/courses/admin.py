from django.contrib import admin
from .models import Course
from .forms import CourseForm


class CourseAdmin(admin.ModelAdmin):
    """
    Adminページで使用するフォームの設定
    """
    form = CourseForm
    list_display = (
        'name', 'year'
    )
    list_filter = (
        'name',
        'year__year'
    )


admin.site.register(Course, CourseAdmin)

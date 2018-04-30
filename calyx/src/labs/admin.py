from django.contrib import admin
from .models import Lab, Rank


class LabAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'course',
        'capacity'
    )
    list_filter = (
        'course',
    )


class RankAdmin(admin.ModelAdmin):
    list_display = (
        'order',
        'user',
        'lab'
    )
    list_filter = (
        'order',
        'user',
        'lab'
    )


admin.site.register(Lab, LabAdmin)
admin.site.register(Rank, RankAdmin)

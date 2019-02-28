from rest_framework import exceptions
from courses.models import Course


class NestedViewSetMixin(object):

    def get_queryset(self):
        queryset = super(NestedViewSetMixin, self).get_queryset()
        serializer_class = self.get_serializer_class()
        if hasattr(serializer_class, 'parent_lookup_kwargs'):
            orm_filters = {}
            for query_param, field_name in serializer_class.parent_lookup_kwargs.items():
                orm_filters[field_name] = self.kwargs[query_param]
            return queryset.filter(**orm_filters)
        return queryset


class CourseNestedMixin(NestedViewSetMixin):

    def get_course(self):
        course_pk = self.kwargs.get("course_pk", None)
        if course_pk is None:
            return None
        if isinstance(course_pk, str):
            course_pk = int(course_pk)
        try:
            course = Course.objects.get(pk=course_pk)
        except Course.DoesNotExist:
            return exceptions.NotFound("指定された課程は存在しません")
        self.check_object_permission(self.request, course)
        return course

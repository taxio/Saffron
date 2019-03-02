from rest_framework import exceptions

from courses.models import Course


class NestedViewSetMixin(object):

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return None
        queryset = super(NestedViewSetMixin, self).get_queryset()
        serializer_class = self.get_serializer_class()
        if hasattr(serializer_class, 'parent_lookup_kwargs'):
            orm_filters = {}
            for query_param, field_name in serializer_class.parent_lookup_kwargs.items():
                orm_filters[field_name] = self.kwargs[query_param]
            return queryset.filter(**orm_filters)
        return queryset


class CourseNestedMixin(object):

    def get_serializer_context(self):
        ctx = super(CourseNestedMixin, self).get_serializer_context()
        if hasattr(self, "course"):
            ctx['course'] = self.course
        else:
            ctx['course'] = self.get_course()
        return ctx

    def get_course(self):
        course_pk = self.kwargs.get("course_pk", None)
        if course_pk is None:
            return None
        if isinstance(course_pk, str):
            course_pk = int(course_pk)
        try:
            self.course = Course.objects.prefetch_related('users').select_related('year', 'config').get(pk=course_pk)
        except Course.DoesNotExist:
            raise exceptions.NotFound("指定された課程は存在しません")
        self.check_object_permissions(self.request, self.course)
        return self.course

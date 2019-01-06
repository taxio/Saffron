import coreapi
import coreschema
from rest_framework import schemas


course_pk_field = coreapi.Field(
    "course_pk",
    required=True,
    location="path",
    schema=coreschema.Integer(description="対象とする課程のプライマリキー")
)


class CourseAdminSchema(schemas.AutoSchema):

    def get_manual_fields(self, path, method):
        manual_fields = super(CourseAdminSchema, self).get_manual_fields(path, method)
        extras = [course_pk_field]
        if method in ["PUT", "PATCH"]:
            extras += [
                coreapi.Field(
                   "id",
                    required=True,
                    location="path",
                    schema=coreschema.Integer(description="対象となる所属メンバーのプライマリキー")
                )
            ]
        return manual_fields + extras


class CourseJoinSchema(schemas.AutoSchema):

    def get_manual_fields(self, path, method):
        manual_fields = super(CourseJoinSchema, self).get_manual_fields(path, method)
        return manual_fields + [course_pk_field]

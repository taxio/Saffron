from .services import get_config_cache


class Status(object):

    OK = 'ok'
    NG = 'insufficient'
    PENDING = 'pending'

    def __init__(self, show_gpa: bool = True, show_username: bool = True, rank_submitted: bool = True):
        self.gpa = show_gpa
        self.screen_name = show_username
        self.rank_submitted = rank_submitted
        self._type = None

    def set_false_all(self):
        self.gpa = False
        self.screen_name = False
        self.rank_submitted = False
        return self

    @classmethod
    def from_user_instance(cls, user, course_pk: int) -> 'Status':
        status = cls()
        if not user.courses.filter(pk=course_pk).exists():
            status._type = cls.PENDING
            return status.set_false_all()
        config = get_config_cache(course_pk)
        if config['show_gpa']:
            if user.gpa is None:
                status.gpa = False
        if config['show_username']:
            if user.screen_name is None or user.screen_name == "":
                status.screen_name = False
        if config['rank_limit'] != user.rank_set.filter(course_id=course_pk).count():
            status.rank_submitted = False
        return status

    @property
    def type_str(self) -> str:
        """Statusの状態によって'ok'または'insufficient'を返す"""
        if self._type is not None:
            return self._type
        ok = True
        for k in [self.gpa, self.screen_name, self.rank_submitted]:
            ok &= k
        if ok:
            return self.OK
        return self.NG


class StatusMessage(object):

    default_messages = {
        Status.OK: '閲覧資格を満たしています．',
        Status.NG: '閲覧資格を満たしていません．',
        Status.PENDING: 'まだどの課程にも加入していません．'
    }

    def __init__(self, user, course_pk: int):
        self.detail = Status.from_user_instance(user, course_pk)
        self.status = self.detail.type_str
        self.status_message = self.default_messages[self.status]

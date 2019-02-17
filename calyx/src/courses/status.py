from .models import get_config_cache


class Status(object):

    def __init__(self, show_gpa: bool = True, show_username: bool = True, rank_submitted: bool = True):
        self.show_gpa = show_gpa
        self.show_username = show_username
        self.rank_submitted = rank_submitted

    def set_false_all(self):
        self.show_gpa = False
        self.show_username = False
        self.rank_submitted = False
        return self

    @classmethod
    def from_user_instance(cls, user, course_pk: int) -> 'Status':
        status = Status()
        config = get_config_cache(course_pk)
        if config['show_gpa']:
            if user.gpa is None:
                status.show_gpa = False
        if config['show_username']:
            if user.username is None or user.username == "":
                status.show_username = False
        if config['rank_limit'] != user.rank_set.filter(course_id=course_pk).count():
            status.rank_submitted = False
        return status

    @property
    def type_str(self) -> str:
        """Statusの状態によって'ok'または'insufficient'を返す"""
        keys = ['show_gpa', 'show_username', 'rank_submitted']
        ok = True
        for k in keys:
            ok |= self.__dict__[k]
        if ok:
            return 'ok'
        return 'insufficient'


class StatusMessage(object):

    default_messages = {
        'ok': '閲覧資格を満たしています．',
        'insufficient': '閲覧資格を満たしていません．',
        'pending': 'まだどの課程にも加入していません．'
    }

    status_types = ('ok', 'insufficient', 'pending')

    def __init__(self, status: str, detail: 'Status' = None):
        if status not in self.status_types:
            raise ValueError(f"Status type '{status}' is not supported.")
        self.status = status
        self.status_message = self.default_messages[status]
        if detail is None:
            self.detail = Status().set_false_all()
        else:
            self.detail = detail



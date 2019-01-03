class AlreadyJoinedError(Exception):

    def __init__(self, course):
        super(AlreadyJoinedError, self).__init__()
        self.course = course

    def __str__(self) -> str:
        return f"既に{self.course.name}へ参加しています．"


class NotJoinedError(Exception):

    def __init__(self, course):
        super(NotJoinedError, self).__init__()
        self.course = course

    def __str__(self):
        return f"{self.course.name}へ参加していません．"


class NotAdminError(Exception):

    def __init__(self, course, user):
        super(NotAdminError, self).__init__()
        self.course = course
        self.user = user

    def __str__(self):
        return f'{self.user.username}は{self.course.name}の管理者ではありません．'

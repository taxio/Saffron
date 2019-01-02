class AlreadyJoinedError(Exception):

    def __init__(self, course):
        super(AlreadyJoinedError, self).__init__()
        self.course = course

    def err_dict(self) -> dict:
        return {
            "message": str(self)
        }

    def __str__(self) -> str:
        return f"既に{self.course.name}へ参加しています．"


class NotJoinedError(Exception):

    def __init__(self, course):
        super(NotJoinedError, self).__init__()
        self.course = course

    def err_dict(self) -> dict:
        return {
            "message": str(self)
        }

    def __str__(self):
        return f"{self.course.name}へ参加していません．"

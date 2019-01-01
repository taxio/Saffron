class AlreadyJoinedError(Exception):

    def __init__(self, user, course):
        super(AlreadyJoinedError, self).__init__()
        self.user = user
        self.course = course

    def err_dict(self) -> dict:
        return {
            "message": str(self)
        }

    def __str__(self) -> str:
        return f"{self.user.username} has already been joined {self.course.name}"


class NotJoinedError(Exception):

    def __init__(self, user):
        super(NotJoinedError, self).__init__()
        self.user = user

    def err_dict(self) -> dict:
        return {
            "message": str(self)
        }

    def __str__(self):
        return f"{self.user.username} has not been joined any course."

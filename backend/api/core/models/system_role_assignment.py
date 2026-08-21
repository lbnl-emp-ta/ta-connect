from django.db import models

from .role import Role
from .user import User


class SystemRoleAssignment(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    role = models.ForeignKey(Role, on_delete=models.PROTECT)
    date_assigned = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "system_role_assignment"

    def __str__(self):
        return f"{self.user.email} | {self.role.name}"

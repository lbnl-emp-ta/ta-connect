from django.db import models
from core.models import *

class ProgramRoleAssignment(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    role = models.ForeignKey(Role, on_delete=models.PROTECT)
    instance = models.ForeignKey(Program, on_delete=models.PROTECT)
    date_assigned = models.DateTimeField(auto_now_add=True) 

    class Meta:
        db_table = "program_role_assignment"
        
    def __str__(self):
        return f"{self.user.email} | {self.role.name} - {self.instance.name}"
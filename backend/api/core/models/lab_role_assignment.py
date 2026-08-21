from django.db import models

from core.constants import ROLE
from core.models import *


class LabRoleAssignment(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    role = models.ForeignKey(Role, on_delete=models.PROTECT)
    instance = models.ForeignKey(Lab, on_delete=models.PROTECT)
    program = models.ForeignKey(Program, on_delete=models.PROTECT) 
    date_assigned = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "lab_role_assignment"
    
    def __str__(self):
        match self.role.name:
            case ROLE.EXPERT:
                return f"{self.user.email} | {self.role.name} - {self.instance.name}"
            
            case _:
                return f"{self.user.email} | {self.role.name} - {self.instance.name} under {self.program.name}"
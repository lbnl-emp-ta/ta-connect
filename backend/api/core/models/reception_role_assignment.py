from django.db import models
from core.models import *

class ReceptionRoleAssignment(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    role = models.ForeignKey(Role, on_delete=models.PROTECT)
    instance = models.ForeignKey(Reception, on_delete=models.PROTECT)
    date_assigned = models.DateTimeField(auto_now_add=True) 

    class Meta:
        db_table = "reception_role_assignment"
        
    def __str__(self):
        return f"{self.user.email} | {self.role.name} - {self.instance.name}"
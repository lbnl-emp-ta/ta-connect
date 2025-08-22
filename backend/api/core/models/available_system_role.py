from django.db import models
from core.models import Role

# See available_lab_role.py and availabe_program_role.py
class AvailableSystemRole(models.Model):
    role = models.ForeignKey(Role, on_delete=models.PROTECT)

    class Meta:
        db_table = "available_system_role"
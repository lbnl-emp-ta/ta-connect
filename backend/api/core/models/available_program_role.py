from django.db import models
from core.models import Role

class AvailableProgramRole(models.Model):
    role = models.ForeignKey(Role, on_delete=models.PROTECT)

    class Meta:
        db_table = "available_program_role"
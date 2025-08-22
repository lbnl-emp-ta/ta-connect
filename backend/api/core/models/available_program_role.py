from django.db import models
from core.models import Role

# Currently unused, supposed to narrow down roles available to only Programs.
# Ex. Should not be able to assign Lab Lead role in Program since that doesn't
# make sense.
class AvailableProgramRole(models.Model):
    role = models.ForeignKey(Role, on_delete=models.PROTECT)

    class Meta:
        db_table = "available_program_role"
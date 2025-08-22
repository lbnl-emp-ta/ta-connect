from django.db import models
from core.models import Role

# Currently unused, supposed to narrow down roles available to only labs.
# Ex. Should not be able to assign Program Lead role in Lab since that doesn't
# make sense.
class AvailableLabRole(models.Model):
    role = models.ForeignKey(Role, on_delete=models.PROTECT)

    class Meta:
        db_table = "available_lab_role"
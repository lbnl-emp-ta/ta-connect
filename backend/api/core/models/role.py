from django.db import models

from core.models import *

class Role(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    statuses = models.ManyToManyField(RequestStatus, related_name="roles")

    class Meta:
        db_table="role"
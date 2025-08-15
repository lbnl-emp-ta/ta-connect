from django.db import models

from core.models import *

class SharedFundingGroup(models.Model):
    name = models.CharField(max_length=256, unique=True)
    description = models.TextField()
    programs = models.ManyToManyField(Program, blank=True, related_name="shared_funding_groups") 

    def __str__(self):
        return f"{self.name}"

    class Meta:
        db_table="shared_funding_group"
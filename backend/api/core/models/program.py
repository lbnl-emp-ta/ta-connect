from django.db import models

from core.models import *

class Program(models.Model):
    name = models.CharField(max_length=256, unique=True)
    description = models.TextField()
    labs = models.ManyToManyField(Lab, blank=True, related_name="programs")

class Meta:
    db_table = "program"
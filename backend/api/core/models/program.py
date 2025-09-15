from django.db import models

from core.models import *

class Program(models.Model):
    name = models.CharField(max_length=256, unique=True)
    description = models.TextField()
    labs = models.ManyToManyField(Lab, blank=True, related_name="programs")
    
    depths = models.ManyToManyField(Depth, blank=True, related_name="programs")
    topics = models.ManyToManyField(Topic, blank=True, related_name="programs")
    filtered_orgs = models.ManyToManyField(Organization, blank=True, related_name="filtered_programs")


    def __str__(self):
        return f"{self.name}"

    class Meta:
        db_table = "program"
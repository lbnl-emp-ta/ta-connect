from django.db import models
from core.models import OrganizationType

class Organization(models.Model):
    name = models.CharField(max_length=256, unique=True)
    address = models.TextField()
    type = models.ForeignKey(OrganizationType, on_delete=models.PROTECT)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = "organization"
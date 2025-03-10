from django.db import models

class OrganizationType(models.Model):
    name = models.CharField(max_length=512, unique=True)
    description = models.TextField()
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = "organization_type"
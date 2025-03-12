from django.db import models

from core.models import Request, Customer

class Cohort(models.Model):
    request = models.ForeignKey(Request, on_delete=models.PROTECT)
    name = models.CharField(max_length=256)
    description = models.TextField()
    
    customers = models.ManyToManyField(Customer)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = "cohort"
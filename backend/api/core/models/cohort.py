from django.db import models

from core.models import Request, Customer

class Cohort(models.Model):
    request = models.ForeignKey(Request, on_delete=models.PROTECT, unique=True)
    name = models.CharField(max_length=256, null=True, blank=True)
    description = models.TextField()

    customer_poc = models.ForeignKey(Customer, on_delete=models.PROTECT)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = "cohort"
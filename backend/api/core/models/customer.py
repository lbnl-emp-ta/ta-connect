from django.db import models

from core.models import Request, Organization, State, TransmissionPlanningRegion

class Customer(models.Model):
    org = models.ForeignKey(Organization, on_delete=models.PROTECT, verbose_name="organization")
    state = models.ForeignKey(State, on_delete=models.PROTECT)
    tpr = models.ForeignKey(TransmissionPlanningRegion, on_delete=models.PROTECT, verbose_name="transmission planning region")
    email = models.EmailField(max_length=256, unique=True)
    name = models.CharField(max_length=256)
    phone = models.CharField(max_length=64, verbose_name="phone number", default=None)
    title = models.CharField(max_length=256, verbose_name="job title")
    
    requests = models.ManyToManyField(Request, through='CustomerRequestRelationship', related_name="customers")
    
    def __str__(self):
        return self.email
    
    class Meta:
        db_table = "customer"
    
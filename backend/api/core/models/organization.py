from django.db import models

from .organization_type import OrganizationType
from .state import State
from .transmission_planning_region import TransmissionPlanningRegion


class Organization(models.Model):
    name = models.CharField(max_length=256, unique=True)
    address = models.TextField()
    state = models.ForeignKey(State, on_delete=models.PROTECT)
    transmission_planning_region = models.ForeignKey(TransmissionPlanningRegion, on_delete=models.PROTECT, verbose_name="transmission planning region")
    type = models.ForeignKey(OrganizationType, on_delete=models.PROTECT)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = "organization"

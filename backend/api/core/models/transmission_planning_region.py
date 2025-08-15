from django.db import models

class TransmissionPlanningRegion(models.Model):
    name = models.CharField(max_length=256, unique=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = "transmission_planning_region"
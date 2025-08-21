from django.db import models

from core.models import State, Cohort

class CohortParticipant(models.Model):
    name = models.CharField(max_length=256)
    email = models.EmailField()
    state = models.ForeignKey(State, on_delete=models.PROTECT)
    
    cohort = models.ForeignKey(Cohort, on_delete=models.CASCADE)

    def __str__(self):
        return self.email
    class Meta:
        db_table="cohort_participant"
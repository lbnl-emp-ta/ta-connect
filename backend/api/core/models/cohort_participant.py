from django.db import models

from core.models import State, Cohort

# Used during the intake form. A request is associated with one main customer, 
# however there may be many other entities associate with that request in the
# form of a cohort. We don't need as much info on these entities as we do customer, 
# so this model represents that.
class CohortParticipant(models.Model):
    name = models.CharField(max_length=256)
    email = models.EmailField()
    state = models.ForeignKey(State, on_delete=models.PROTECT)
    
    cohort = models.ForeignKey(Cohort, on_delete=models.CASCADE)

    def __str__(self):
        return self.email
    class Meta:
        db_table="cohort_participant"
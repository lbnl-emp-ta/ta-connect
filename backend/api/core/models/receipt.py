from django.db import models 

from core.models import *

class Receipt(models.Model):
    program = models.ForeignKey(Program, blank=True, null=True, on_delete=models.PROTECT)
    lab = models.ForeignKey(Lab, blank=True, null=True, on_delete=models.PROTECT)
    expert = models.ForeignKey(User, blank=True, null=True, on_delete=models.PROTECT)

    def __str__(self):
        return f"Receipt for Request #{self.request.pk}"

    class Meta:
        db_table = "receipt"
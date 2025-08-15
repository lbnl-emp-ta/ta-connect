from django.db import models 

from core.models import *

# Used to orient a request within a program. Without this information a 
# request would be ambiguous. For example:
#
# A request that is owned by a lab participating in two or more programs (A and B) would be ambiguous. 
# Is the request downstream of Program A, or Program B? There would be no way of knowing to 
# which program the request belongs.
class Receipt(models.Model):
    program = models.ForeignKey(Program, blank=True, null=True, on_delete=models.PROTECT)
    lab = models.ForeignKey(Lab, blank=True, null=True, on_delete=models.PROTECT)
    expert = models.ForeignKey(User, blank=True, null=True, on_delete=models.PROTECT)

    def __str__(self):
        if hasattr(self, "request"):
            return f"Receipt for Request #{self.request.pk}"
        
        return f"Receipt #{self.pk}"

    class Meta:
        db_table = "receipt"
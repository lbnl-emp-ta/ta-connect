from django.db import models

from core.models import *

# Example audit history actions
class ActionType(models.TextChoices):
    Assignment="Assignment"
    AddAttachment="Add Attachment"
    RemoveAttachment="Remove Attachment"
    EditRequestInfo="Edit Request Information"
    EditCustomerInfo="Edit Customer Information"


class AuditHistory(models.Model):
    request = models.OneToOneField(Request, on_delete=models.PROTECT) 
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    role = models.ForeignKey(Role, on_delete=models.PROTECT)
    action_type = models.CharField(max_length=64, choices=ActionType)
    description = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        if hasattr(self, "request"):
            return f"Audit History for Request #{self.request.pk}"
        else:
            return f"Audit History #{self.pk}"

    class Meta:
        db_table="audit_history"
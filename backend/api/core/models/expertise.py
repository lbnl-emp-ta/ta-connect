from django.core.exceptions import ValidationError
from django.db import models

from .depth import Depth
from .lab_role_assignment import LabRoleAssignment
from .topic import Topic
from .user import User


# After a user is assigned an Expert role, they must also have various
# expertises identified via this model to be properly filtered in expert views.
class Expertise(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    lab_role_assignment = models.ForeignKey(LabRoleAssignment, on_delete=models.PROTECT, related_name="expertises")
    topic = models.ForeignKey(Topic, on_delete=models.PROTECT)
    depth = models.ForeignKey(Depth, on_delete=models.PROTECT)

    def clean(self):
        if self.user_id != self.lab_role_assignment.user_id:
            raise ValidationError("Expertise user must match the lab role assignment user.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.email} | {self.topic.name} - {self.depth.name}"

    class Meta:
        db_table = "expertise"

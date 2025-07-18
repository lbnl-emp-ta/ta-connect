from django.db import models
from core.models import *

class Expertise(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    topic = models.ForeignKey(Topic, on_delete=models.PROTECT)
    depth = models.ForeignKey(Depth, on_delete=models.PROTECT)

    def __str__(self):
        return f"{self.user.email} | {self.topic.name} - {self.depth.name}"

    class Meta:
        db_table = "expertise"
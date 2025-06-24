from django.db import models
from core.models import *

class Expertise(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    topic = models.ForeignKey(Topic, on_delete=models.PROTECT)
    depth = models.ForeignKey(Depth, on_delete=models.PROTECT)

    class Meta:
        db_table = "expertise"
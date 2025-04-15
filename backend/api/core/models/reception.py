from django.db import models

class Reception(models.Model):
    name = models.CharField(max_length=256, unique=True)

class Meta:
    db_table = "reception"
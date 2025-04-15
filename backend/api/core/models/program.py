from django.db import models

class Program(models.Model):
    name = models.CharField(max_length=256, unique=True)
    description = models.TextField()

class Meta:
    db_table = "program"
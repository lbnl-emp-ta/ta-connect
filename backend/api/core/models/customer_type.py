from django.db import models

class CustomerType(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField()
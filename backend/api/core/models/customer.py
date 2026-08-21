from django.db import models

from core.models import Request


class Customer(models.Model):
    email = models.EmailField(max_length=256, unique=True)
    name = models.CharField(max_length=256)
    phone = models.CharField(max_length=64, verbose_name="phone number", default=None)
    title = models.CharField(max_length=256, verbose_name="job title")
    
    requests = models.ManyToManyField(Request, through='CustomerRequestRelationship', related_name="customers")
    
    def __str__(self):
        return self.email
    
    class Meta:
        db_table = "customer"
    
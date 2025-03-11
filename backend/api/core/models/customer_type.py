from django.db import models

class CustomerType(models.Model):
    name = models.CharField(max_length=128)
    description = models.TextField()
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = "customer_type"
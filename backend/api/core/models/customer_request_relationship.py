from django.db import models

from core.models import *

class CustomerRequestRelationship(models.Model):
    request = models.ForeignKey(Request, on_delete=models.PROTECT)
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT)
    is_poc = models.BooleanField(default=True, help_text="Whether the customer is the point of contact for the request")

    def __str__(self):
        return self.request.__str__() + " - " + self.customer.__str__()
    
    class Meta:
        db_table = "customer_request_relationship"
        
        constraints = [
            models.UniqueConstraint(fields=['customer', 'request'], name='unique_customer_request')
        ]

        
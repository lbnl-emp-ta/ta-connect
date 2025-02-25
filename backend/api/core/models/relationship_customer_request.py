from django.db import models

class CustomerRequest(models.Model):
    customer = models.ForeignKey('core.Customer', on_delete=models.CASCADE)
    request = models.ForeignKey('core.Request', on_delete=models.CASCADE)
    type = models.ForeignKey('core.CustomerType', on_delete=models.PROTECT)
    last_outgoing_interaction = models.DateTimeField(blank=True, null=True)
    last_incoming_interaction = models.DateTimeField(blank=True, null=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['customer', 'request'], name='unique_customer_request')
        ]

    def __str__(self):
        return self.pk 
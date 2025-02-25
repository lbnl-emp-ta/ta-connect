from django.db import models

class Customer(models.Model):
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True, db_index=True) 
    phone_number = models.CharField(max_length=32)
    job_title = models.CharField(max_length=255)
    organization = models.ForeignKey('core.Organization', on_delete=models.PROTECT)
    state = models.ForeignKey('core.State', on_delete=models.PROTECT)

    requests = models.ManyToManyField('core.Request', through='core.RelationshipCustomerRequest')

    def __str__(self):
        return self.email 
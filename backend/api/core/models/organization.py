from django.db import models

class Organization(models.Model):
    name = models.CharField(max_length=255, unique=True)
    address = models.CharField(max_length=1024)
    type = models.ForeignKey('core.OrganizationType', null=True, on_delete=models.PROTECT)

    def __str__(self):
        return self.name
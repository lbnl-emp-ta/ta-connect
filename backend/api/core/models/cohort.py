from django.db import models

class Cohort(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    request = models.ForeignKey('core.Request', on_delete=models.PROTECT)

    customers = models.ManyToManyField('core.Customer')

    def __str__(self):
        return self.name
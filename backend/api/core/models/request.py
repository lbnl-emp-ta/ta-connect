from django.db import models

class Request(models.Model):
    status = models.ForeignKey('core.RequestStatus', on_delete=models.PROTECT)
    description = models.TextField()
    date_submitted = models.DateField(auto_now_add=True)
    projected_start_date = models.DateField(blank=True, null=True)
    projected_end_date = models.DateField(blank=True, null=True)
    completion_date = models.DateField(blank=True, null=True)
    statement_of_work_date = models.DateField(blank=True, null=True)
    depth = models.ForeignKey('core.Depth', blank=True, null=True, on_delete=models.PROTECT)

    sectors = models.ManyToManyField('core.Sector')
    topics = models.ManyToManyField('core.Topic')

    def __str__(self):
        return self.pk
    
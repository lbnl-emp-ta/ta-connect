from django.db import models

class Request(models.Model):
    status = models.ForeignKey("core.RequestStatus", on_delete=models.PROTECT)
    description = models.TextField()
    date_created = models.DateTimeField(auto_now_add=True)
    proj_start_date = models.DateTimeField(blank=True, null=True, verbose_name="projected start date")
    proj_completion_date = models.DateTimeField(blank=True, null=True, verbose_name="projected completion date")
    actual_completion_date = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Request #{self.pk}"
    
    class Meta:
        db_table = "request"
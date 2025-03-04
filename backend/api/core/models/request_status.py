from django.db import models

class RequestStatus(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()

    @classmethod
    def get_default_pk(cls):
        status, _ = cls.objects.get_or_create(
            name="New",
            description="The default status of a new request."
        )

        return status.pk

    def __str__(self):
        return self.name
    
    class Meta:
        db_table = "request_status"
        verbose_name = "request status"
        verbose_name_plural = "request statuses"
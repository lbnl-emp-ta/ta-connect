from django.db import models
from django.utils.functional import classproperty

class RequestStatus(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField()
    
    @classproperty
    def default_name(cls):
        return "New"
    
    @classproperty
    def default_description(cls):
        return "The default status of a new Request"

    @classmethod
    def get_default_pk(cls):
        """
        When a new core.models.Request is created, we want to ensure that
        it has an appropriate status to reflect that. This method makes
        sure that there exists a default status to assigned to any new
        Request that is created.
        """
        status, _ = cls.objects.get_or_create(
            name=cls.default_name,
            description=cls.default_description
        )

        return status.pk

    def __str__(self):
        return self.name
    
    class Meta:
        db_table = "request_status"
        verbose_name = "request status"
        verbose_name_plural = "request statuses"
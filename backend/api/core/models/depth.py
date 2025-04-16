from django.db import models
from django.utils.functional import classproperty

class Depth(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField()

    @classproperty
    def default_name(cls):
        return "Unknown"
    
    @classproperty
    def default_description(cls):
        return "Scope of Request has yet to be determined."

    @classmethod
    def get_default_pk(cls):
        depth, _ = cls.objects.get_or_create(
            name=cls.default_name,
            description=cls.default_description
        )

        return depth.pk
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = "depth"
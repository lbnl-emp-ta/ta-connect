from django.db import models
from django.utils.functional import classproperty


class Reception(models.Model):
    name = models.CharField(max_length=256, unique=True)

    @classproperty
    def default_name(cls):
        return "Reception"
    
    @classmethod
    def get_default_pk(cls):
        reception, _  = cls.objects.get_or_create(
            name=cls.default_name
        )

        return reception.pk
    
    def __str__(self):
        return "Reception"
        

class Meta:
    db_table = "reception"

from django.db import models

class State(models.Model):
    name = models.CharField(max_length=255, unique=True, db_index=True)
    abbreviation = models.CharField(max_length=16, unique=True, db_index=True)

    region = models.ForeignKey('core.Region', blank=True, null=True, on_delete=models.DO_NOTHING)

    def __str__(self):
        return self.name
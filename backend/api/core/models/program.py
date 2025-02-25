from django.db import models

class Program(models.Model):
    name = models.CharField(max_length=255, unique=True, db_index=True)
    description = models.TextField()

    labs = models.ManyToManyField('core.Lab', through='core.RelationshipProgramLab')

    def __str__(self):
        return self.name
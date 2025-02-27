from django.db import models

class Topic(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()

    sectors = models.ManyToManyField('core.Sector')


    def __str__(self):
        return self.name
from django.db import models

class Program(models.Model):
    name = models.CharField(max_length=255, unique=True, db_index=True)
    description = models.TextField()

    labs = models.ManyToManyField('core.Lab')
    topics = models.ManyToManyField('core.Topic')
    depths = models.ManyToManyField('core.Depth')

    def __str__(self):
        return self.name
from django.db import models

class State(models.Model):
    name = models.CharField(max_length=255, unique=True)
    abbreviation = models.CharField(max_length=16, unique=True)

    def __str__(self):
        return self.name
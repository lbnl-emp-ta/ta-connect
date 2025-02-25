from django.db import models

class Team(models.Model):
    name = models.CharField(max_length=255, unique=True, db_index=True)
    description = models.TextField()

    lab = models.ForeignKey('core.Lab', on_delete=models.CASCADE)

    def __str__(self):
        return self.name
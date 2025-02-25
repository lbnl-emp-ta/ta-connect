from django.db import models

class RequestStatus(models.Model):
    name = models.CharField(max_length=128, unique=True, db_index=True)
    description = models.TextField()

    def __str__(self):
        return self.name
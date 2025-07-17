from django.db import models

class Lab(models.Model):
    name = models.CharField(max_length=256, unique=True)
    description = models.TextField()

    def __str__(self):
        return f"{self.name}"

    class Meta:
        db_table = "lab"
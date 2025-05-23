from django.db import models

class Role(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()

    class Meta:
        db_table="role"
from django.db import models

class Depth(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField()
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = "depth"
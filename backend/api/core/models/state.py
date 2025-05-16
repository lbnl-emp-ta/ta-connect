from django.db import models

class State(models.Model):
    name = models.CharField(max_length=32, unique=True)
    abbreviation = models.SlugField(unique=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = "state"

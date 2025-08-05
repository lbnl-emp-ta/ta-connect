from django.db import models 

from core.models import *

class Note(models.Model):
    author = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    request = models.ForeignKey(Request, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notes #{self.pk} for Request #{self.request.pk}"
    
    class Meta:
        db_table="note"
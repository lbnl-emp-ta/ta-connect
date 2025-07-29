from django.db import models

from core.models import Request

class Attachment(models.Model):
    file = models.FileField(upload_to='attachments/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    request = models.ForeignKey(Request, on_delete=models.PROTECT)
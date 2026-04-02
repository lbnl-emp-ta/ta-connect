import os
from django.conf import settings 
from django.db import models
from django.dispatch import receiver
from django.db.models.signals import post_delete
from core.models import Request, User

# Need to ensure unique filepath name to ensure arbitrary search
def generate_upload_filepath(instance, filename):
    return f"attachments/request_ID{instance.request.pk}/{filename}"

class Attachment(models.Model):
    file = models.FileField(upload_to=generate_upload_filepath)
    title = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True, null=True)
    
    user_who_uploaded = models.ForeignKey(User, on_delete=models.PROTECT, null=True)
    request = models.ForeignKey(Request, on_delete=models.PROTECT)
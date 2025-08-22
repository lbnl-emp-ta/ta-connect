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


# After an attachment model is deleted in the database, the underlying file
# needs to be cleaned up as well.
@receiver(post_delete, sender=Attachment)
def clean_up_after_attachment_deletion(sender, instance, **kwargs):
    if hasattr(instance, "file"):
        if os.path.isfile(instance.file.path):
            os.remove(instance.file.path)
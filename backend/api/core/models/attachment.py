from django.db import models
from core.models import Request, User

def generate_upload_filepath(instance, filename):
    return f"attachments/request_ID{instance.request.pk}/{filename}"

class Attachment(models.Model):
    file = models.FileField(upload_to=generate_upload_filepath)
    file_name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True, null=True)
    
    user_who_uploaded = models.ForeignKey(User, on_delete=models.PROTECT, null=True)
    request = models.ForeignKey(Request, on_delete=models.PROTECT)
from rest_framework import serializers

from core.models import Attachment

class AttachmentUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['file', 'request', 'description']
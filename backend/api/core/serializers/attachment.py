from rest_framework import serializers

from core.models import Attachment

class AttachmentUploadSerializer(serializers.ModelSerializer):
    def validate_file_name(self, value):
        request_id = self.get_initial()["request"]
        if Attachment.objects.filter(file_name=value, request=request_id).exists():
            raise serializers.ValidationError("A file with that name already exists for given request") 
        
        return value

    class Meta:
        model = Attachment
        fields = ['file', 'request', 'description', 'user_who_uploaded', 'file_name']
import json

from django.http import FileResponse
from rest_framework import permissions, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from core.models import Attachment, Request
from core.models.audit_history import ActionType
from core.permissions import *
from core.serializers import (
    AttachmentEditSerializer,
    AttachmentSerializer,
    AttachmentUploadSerializer,
)
from core.utils import create_audit_history
from core.views.request import BaseUserAwareRequest


class UploadAttachmentView(BaseUserAwareRequest):
    serializer_class = AttachmentUploadSerializer 
    
    parser_classes = [MultiPartParser, FormParser]

    permission_classes = [
        permissions.IsAuthenticated,
        CanAddAttachment
    ]

    def post(self, request, request_id):
        ta_request, err = self.get_request_or_error(Request.objects.all(), request_id)
        if err:
            return err

        if not CanAddAttachment().has_object_permission(request, self, ta_request):
            return Response(data={"message": "Insufficient authorization to upload attachment for given request"}, status=status.HTTP_403_FORBIDDEN)

        if not request.data.get("file"):
            return Response(data={"message": "File to upload missing"}, status=status.HTTP_400_BAD_REQUEST)

        
        attachment_data = dict()
        attachment_data["file"] = request.data.get("file")
        attachment_data["request"] = request_id
        attachment_data["user_who_uploaded"] = request.user.id

        # Title cannot be just whitespace otherwise will throw serialization error later
        if "title" in request.data and request.data.get("title").strip(): 
            attachment_data["title"] = request.data.get("title").strip()
        else:
            attachment_data["title"] = request.data.get("file").__str__()

        if "description" in request.data:
            attachment_data["description"] = request.data.get("description")

        serializer = self.serializer_class(data=attachment_data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        attachment = serializer.save()
        create_audit_history(request, ta_request, ActionType.AddAttachment, f"Uploaded attachment: {attachment.title}")
        
        return Response(data={"message": "Attachment successfully uploaded"}, status=status.HTTP_201_CREATED)

class DownloadAttachmentView(BaseUserAwareRequest):
    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def get(self, request, request_id, attachment_id):
        visible_requests = self.get_actionable() | self.get_downstream() | self.get_inactive()
        ta_request, err = self.get_request_or_error(visible_requests, request_id)
        if err:
            return err

        if not visible_requests.contains(ta_request):
            return Response(data={"message": "Insufficient authorization to download attachment for given request"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            attachment = Attachment.objects.get(pk=attachment_id)
        except Attachment.DoesNotExist:
            return Response(data={"message": "Attachment with given filename does not exist"}, status=status.HTTP_400_BAD_REQUEST) 
        
        return FileResponse(open(attachment.file.path, "rb"), as_attachment=True)

class DeleteAttachmentView(BaseUserAwareRequest):
    permission_classes = [
        permissions.IsAuthenticated,
        CanDeleteAttachment,
    ]
    
    def delete(self, request, request_id, attachment_id):
        ta_request, err = self.get_request_or_error(Request.objects.all(), request_id)
        if err:
            return err

        try:
            attachment = Attachment.objects.get(pk=attachment_id)
        except Attachment.DoesNotExist:
            return Response(data={"message": "Attachment with given filename does not exist"}, status=status.HTTP_400_BAD_REQUEST) 
        
        if not CanDeleteAttachment().has_object_permission(request, self, ta_request):
            return Response(data={"message": "Insufficient authorization to delete attachment for given request"}, status=status.HTTP_403_FORBIDDEN)
        
        attachment_title = attachment.title  # Store title before deletion
        attachment.delete()
        create_audit_history(request, ta_request, ActionType.RemoveAttachment, f"Deleted attachment: {attachment_title}")

        return Response(data={"message": "Attachment deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

class EditAttachmentView(BaseUserAwareRequest):
    permission_classes = [
        permissions.IsAuthenticated,
        CanEditAttachment,
    ]
   
    def patch(self, request, request_id, attachment_id):
        ta_request, err = self.get_request_or_error(Request.objects.all(), request_id)
        if err:
            return err

        try:
            attachment_obj = Attachment.objects.get(pk=attachment_id)  
        except Attachment.DoesNotExist:
            return Response(data={"message": "Attachment with given filename does not exist for given request"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not CanEditAttachment().has_object_permission(request, self, ta_request):
            return Response(data={"message": "Insufficient authorization to edit attachment for given request"}, status=status.HTTP_403_FORBIDDEN)
         
        body = json.loads(request.body)

        patch_data = dict()

        if not body:
            return Response(data={"message": "Missing request body"}, status=status.HTTP_204_NO_CONTENT)
        
        if "title" in body:
            if not body.get("title"): 
                return Response(data={"message": "Cannot clear title field"}, status=status.HTTP_400_BAD_REQUEST)
                
            patch_data["title"] = body.get("title")

        if "description" in body:
            new_description_data = body.get("description")
            if new_description_data is None:
                new_description_data = ""
                
            patch_data["description"] = new_description_data 
    
        
        serializer = AttachmentEditSerializer(instance=attachment_obj, data=patch_data, partial=True)
        if serializer.is_valid():
            serializer.save()
        
        return Response(data=AttachmentSerializer(Attachment.objects.get(pk=attachment_obj.pk)).data, status=status.HTTP_200_OK)
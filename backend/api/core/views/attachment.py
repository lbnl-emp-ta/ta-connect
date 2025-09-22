import json
from django.conf import settings
from django.http import FileResponse
    
from rest_framework import views, authentication, permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from core.utils import create_audit_history
from core.views.request import BaseUserAwareRequest
from core.serializers import AttachmentUploadSerializer, AttachmentEditSerializer, AttachmentSerializer
from core.models import Attachment, Request
from core.models.audit_history import ActionType
from core.permissions import *

from allauth.headless.contrib.rest_framework.authentication import (
    XSessionTokenAuthentication,
)

class UploadAttachmentView(views.APIView):
    serializer_class = AttachmentUploadSerializer 
    
    parser_classes = [MultiPartParser, FormParser]

    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def post(self, request, request_id):
        try:
            request_obj = Request.objects.get(pk=request_id)
        except Request.DoesNotExist:
            return Response(data={"message": "Request with given id does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        if not BaseUserAwareRequest(request=request).get_actionable().contains(request_obj):
            return Response(data={"message": "Insufficient authorization to upload attachment for given request"}, status=status.HTTP_400_BAD_REQUEST)

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
        create_audit_history(request, request_obj, ActionType.AddAttachment, f"Uploaded attachment: {attachment.title}")
        
        return Response(data={"message": "Attachment successfully uploaded"}, status=status.HTTP_201_CREATED)

class DownloadAttachmentView(views.APIView):
    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def get(self, request, request_id, attachment_id):
        try:
            request_obj = Request.objects.get(pk=request_id)
        except Request.DoesNotExist:
            return Response(data={"message": "Request with given id does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        user_aware_request_view = BaseUserAwareRequest(request=request)
        if not (user_aware_request_view.get_actionable() | user_aware_request_view.get_downstream()).contains(request_obj):
            return Response(data={"message": "Insufficient authorization to download attachment for given request"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            attachment = Attachment.objects.get(pk=attachment_id)
        except Attachment.DoesNotExist:
            return Response(data={"message": "Attachment with given filename does not exist"}, status=status.HTTP_400_BAD_REQUEST) 
        
        return FileResponse(open(attachment.file.path, "rb"), as_attachment=True)

class DeleteAttachmentView(views.APIView):
    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
    ]
    
    def delete(self, request, request_id, attachment_id):
        try:
            request_obj = Request.objects.get(pk=request_id)
        except Request.DoesNotExist:
            return Response(data={"message": "Request with given id does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            attachment = Attachment.objects.get(pk=attachment_id)
        except Attachment.DoesNotExist:
            return Response(data={"message": "Attachment with given filename does not exist"}, status=status.HTTP_400_BAD_REQUEST) 
        
        can_delete = False 

        if IsAdmin().has_permission(request) or \
           IsCoordinator().has_permission(request) or \
           IsProgramLead().has_permission(request) or \
           IsLabLead().has_permission(request):
            
            user_aware_request_view = BaseUserAwareRequest(request=request)
            if (user_aware_request_view.get_actionable() | user_aware_request_view.get_downstream()).contains(request_obj):
                can_delete = True 

        elif (attachment.user_who_uploaded is not None) and \
             (request.user.id == attachment.user_who_uploaded.pk):

            can_delete = True
             
        if can_delete:
            attachment_title = attachment.title  # Store title before deletion
            attachment.delete()
            create_audit_history(request, request_obj, ActionType.RemoveAttachment, f"Deleted attachment: {attachment_title}")
        else:
            return Response(data={"message": "Insufficient authorization to delete attachment for given request"}, status=status.HTTP_400_BAD_REQUEST)

        return Response(data={"message": "Attachment deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

class EditAttachmentView(views.APIView):
    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
    ]
   
    # filename, description
    def patch(self, request, request_id, attachment_id):
        try:
            request_obj = Request.objects.get(pk=request_id)
        except Request.DoesNotExist:
            return Response(data={"message": "Given request does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            attachment_obj = Attachment.objects.get(pk=attachment_id)  
        except Attachment.DoesNotExist:
            return Response(data={"message": "Attachment with given filename does not exist for given request"}, status=status.HTTP_400_BAD_REQUEST)
         
        body = json.loads(request.body)

        patch_data = dict()

        if not body:
            return Response(data={"message": "Missing request body"}, status=status.HTTP_204_NO_CONTENT)

        can_edit = False
        if IsAdmin().has_permission(request) or \
           IsCoordinator().has_permission(request) or \
           IsProgramLead().has_permission(request) or \
           IsLabLead().has_permission(request):
            
            user_aware_request_view = BaseUserAwareRequest(request=request)
            if (user_aware_request_view.get_actionable() | user_aware_request_view.get_downstream()).contains(request_obj):
                can_edit = True  

        elif (attachment_obj.user_who_uploaded is not None) and \
             (request.user.id == attachment_obj.user_who_uploaded.pk):

            can_edit = True
        
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
        if can_edit and serializer.is_valid():
            serializer.save()
        
        # return updated attachment data
        return Response(data=AttachmentSerializer(Attachment.objects.get(pk=attachment_obj.pk)).data, status=status.HTTP_200_OK)
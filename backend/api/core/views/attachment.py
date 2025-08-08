import json
from django.conf import settings
from django.http import FileResponse
    
from rest_framework import views, authentication, permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from core.views.request import BaseUserAwareRequest
from core.serializers import AttachmentUploadSerializer, AttachmentEditSerializer, AttachmentSerializer
from core.models import Attachment, Request, User
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
        attachment_data["file_name"] = request.data.get("file").__str__()
        attachment_data["request"] = request_id
        attachment_data["user_who_uploaded"] = request.user.id
        
        if "description" in request.data:
            attachment_data["description"] = request.data.get("description")

        serializer = self.serializer_class(data=attachment_data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save()
        return Response(data={"message": "Attachment successfully uploaded"}, status=status.HTTP_201_CREATED)

class DownloadAttachmentView(views.APIView):
    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def get(self, request, request_id, filename):
        try:
            request_obj = Request.objects.get(pk=request_id)
        except Request.DoesNotExist:
            return Response(data={"message": "Request with given id does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        user_aware_request_view = BaseUserAwareRequest(request=request)
        if not (user_aware_request_view.get_actionable() | user_aware_request_view.get_downstream()).contains(request_obj):
            return Response(data={"message": "Insufficient authorization to download attachment for given request"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            attachment = Attachment.objects.get(file_name=filename, request=request_obj)
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
    
    def delete(self, request, request_id, filename):
        try:
            request_obj = Request.objects.get(pk=request_id)
        except Request.DoesNotExist:
            return Response(data={"message": "Request with given id does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            attachment = Attachment.objects.get(file_name=filename, request=request_obj)
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
            attachment.delete()
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
    def patch(self, request, request_id, filename):
        try:
            request_obj = Request.objects.get(pk=request_id)
        except Request.DoesNotExist:
            return Response(data={"message": "Given request does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            attachment_obj = Attachment.objects.get(file_name=filename, request=request_obj)  
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
        
        if "file_name" in body:
            if not body.get("file_name"): 
                return Response(data={"message": "Cannot clear file_name field"}, status=status.HTTP_400_BAD_REQUEST)
                
            patch_data["file_name"] = body.get("file_name")

        if "description" in body:
            new_description_data = body.get("description")
            if new_description_data is None:
                new_description_data = ""
                
            patch_data["description"] = new_description_data 
    
        
        serializer = AttachmentEditSerializer(instance=attachment_obj, data=patch_data, partial=True)
        if can_edit and serializer.is_valid():
            serializer.save()
        
        return Response(data=AttachmentSerializer(Attachment.objects.get(pk=attachment_obj.pk)).data, status=status.HTTP_200_OK)
import json
from django.conf import settings
from django.http import FileResponse
    
from rest_framework import views, authentication, permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from core.views.request import BaseUserAwareRequest
from core.serializers import AttachmentUploadSerializer
from core.models import Attachment, Request

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
            return Response(data={"message": "Insufficient authorization to upload file for given request"}, status=status.HTTP_400_BAD_REQUEST)

        if not request.data.get("file"):
            return Response(data={"message": "File to upload missing"}, status=status.HTTP_400_BAD_REQUEST)
        
        attachment_data = dict()
        attachment_data["file"] = request.data.get("file")
        attachment_data["title"] = request.data.get("file").__str__()
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

    def get(self, request, request_id, attachment_id):
        try:
            request_obj = Request.objects.get(pk=request_id)
        except Request.DoesNotExist:
            return Response(data={"message": "Request with given id does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        user_aware_request_view = BaseUserAwareRequest(request=request)
        if not (user_aware_request_view.get_actionable() | user_aware_request_view.get_downstream()).contains(request_obj):
            return Response(data={"message": "Insufficient authorization to download file for given request"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            attachment = Attachment.objects.get(pk=attachment_id, request=request_obj)
        except Attachment.DoesNotExist:
            return Response(data={"message": "Attachment with given filename does not exist"}, status=status.HTTP_400_BAD_REQUEST) 
        
        return FileResponse(open(attachment.file.path, "rb"), as_attachment=True)
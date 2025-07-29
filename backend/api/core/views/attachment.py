from rest_framework import views, authentication, permissions, status
from rest_framework.response import Response

from core.serializers import AttachmentUploadSerializer

from allauth.headless.contrib.rest_framework.authentication import (
    XSessionTokenAuthentication,
)

class UploadAttachmentView(views.APIView):
    serializer_class = AttachmentUploadSerializer 

    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def post(self, request, request_id):
        if not request.data.get("file"):
            return Response(data={"message": "File to upload missing"}, status=status.HTTP_400_BAD_REQUEST)
        
        attachment_data = dict()
        attachment_data["file"] = request.data.get("file")
        attachment_data["request"] = request_id

        serializer = self.serializer_class(data=attachment_data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save()
        return Response(status=status.HTTP_201_CREATED)
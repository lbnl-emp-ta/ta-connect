from rest_framework import views, status, permissions, authentication
from rest_framework.response import Response

from allauth.headless.contrib.rest_framework.authentication import (
    XSessionTokenAuthentication,
)

class AuditHistoryListView(views.APIView):
    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def get(self, request, request_id):
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)
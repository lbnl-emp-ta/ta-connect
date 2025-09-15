from rest_framework import views, status, permissions, authentication
from rest_framework.response import Response

from core.views.request import BaseUserAwareRequest
from core.models import *
from core.serializers import *

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
        try:
            request_obj = Request.objects.get(pk=request_id)
        except Request.DoesNotExist:
            return Response(data={"message":"Request with given ID does not exist"}, status=status.HTTP_400_BAD_REQUEST)
        
        user_aware_request_view = BaseUserAwareRequest(request=request)
        if not (user_aware_request_view.get_actionable() | user_aware_request_view.get_downstream()).contains(request_obj):
            return Response(data={"message": "Insufficient authorization to view audit history for given request"}, status=status.HTTP_400_BAD_REQUEST)
        
        audit_histories = AuditHistory.objects.filter(request=request_obj) 
        if not audit_histories.exists():
            return Response(data=list(), status=status.HTTP_204_NO_CONTENT)

        serializer = AuditHistorySerializer(audit_histories, many=True)

        return Response(data=serializer.data, status=status.HTTP_200_OK)
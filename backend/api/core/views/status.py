import json

from rest_framework import views, status, permissions, authentication
from rest_framework.response import Response

from core.permissions import *
from core.serializers import *

from allauth.headless.contrib.rest_framework.authentication import (
    XSessionTokenAuthentication,
)

from core.models import *

class StatusListView(views.APIView):
    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def get(self, request, format=None):
        maybe_context = self.request.headers.get("Context")
        if maybe_context is None:
            return Response(data={"message": "Request is missing required context."}, status=status.HTTP_400_BAD_REQUEST)

        context = json.loads(maybe_context)

        if not (request.user.id == context.get("user").id):
            return Response(data={"message": "User mismatch. Given user does not match logged in user."}, status=status.HTTP_400_BAD_REQUEST)

        if context.get("role") is None:
            return Response(data={"message": "Missing role information in context."}, status=status.HTTP_400_BAD_REQUEST)
        
        role = None
        try:
            role = Role.objects.get(pk=context.get("role"))
        except:
            return Response(data={"message": "Given role does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        if not has_role(request, role.name):
            return Response(data={"message": "User has not been assigned given role."}, status=status.HTTP_400_BAD_REQUEST)
        
        available_statuses = role.statuses

        return Response(data=RequestStatusSerializer(available_statuses, many=True).data, status=status.HTTP_200_OK)
import json
from rest_framework import views, status, authentication, permissions
from rest_framework.response import Response

from allauth.headless.contrib.rest_framework.authentication import (
    XSessionTokenAuthentication,
)

from core.views import OwnerListView, request 
from core.models import *

class AssignmentView(views.APIView):
    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def post(self, request_id=None, owner_id=None):
        maybe_context = self.request.headers.get("Context")
        if not maybe_context:
            return Response(data={"message": "Please provide context object header with request."}, status=status.HTTP_400_BAD_REQUEST)
        
        context = json.loads(maybe_context)

        if not request_id:
            return Response(data={"message": "Please provide a request ID for assignment."}, status=status.HTTP_400_BAD_REQUEST)

        if not owner_id:
            return Response(data={"message": "Please provide an owner ID for assignment."}, status=status.HTTP_400_BAD_REQUEST)

        possible_owners = OwnerListView(request=self.request).get_queryset()
        actionable_requests = request.BaseUserAwareRequest(request=self.request).get_queryset()

        request = None
        try:
            request = Request.objects.get(pk=request_id)
        except Request.DoesNotExist:
            return Response(data={"message": "A request with given ID does not exist."}, status=status.HTTP_400_BAD_REQUEST)

        if (not actionable_requests) or (actionable_requests.filter(id=request_id)):  
            return Response(data={"message": "Request is not actionable for the current user identity."}, status=status.HTTP_400_BAD_REQUEST)

        new_owner = None
        try:
            new_owner = Owner.objects.get(pk=owner_id)
        except Owner.DoesNotExist:
            return Response(data={"message": "Owner with given ID does not exist."}, status=status.HTTP_400_BAD_REQUEST)

        if (not possible_owners) or (possible_owners.filter(id=owner_id)):  
            return Response(data={"message": "Current user identity cannot assign to that owner."}, status=status.HTTP_400_BAD_REQUEST)
        
        # handle side effects + changing of owner atomically
        # What needs to happen when we assign?
        # 1. owner needs to change
        # 2. receipt needs to update
        # 3. expert field might need to be cleared
        # 4. (future) notification system engaged
        # try:
        #     request.owner = new_owner
        #     new_owner.domain_type
        # except Exception as e:
        #     return Response(data={"message": f"{e}"}, status=status.HTTP_501_NOT_IMPLEMENTED)
        
        return Response(data={"message": "This endpoint is not fully implemented yet!"}, status=status.HTTP_501_NOT_IMPLEMENTED)
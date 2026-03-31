from rest_framework import views, status, authentication, permissions
from rest_framework.response import Response
from django.db import transaction

from allauth.headless.contrib.rest_framework.authentication import (
    XSessionTokenAuthentication,
)

from core.utils import create_audit_history
from core.permissions import IsAdmin, IsLabLead
from core.views.owner import OwnerListView
from core.models import *
from core.models.audit_history import ActionType
from core.constants import DOMAINTYPE, ROLE

class AssignmentView(views.APIView):
    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def post(self, request):
        # Import BaseUserAwareRequest here to avoid circular import
        from core.views.request import BaseUserAwareRequest

        body = request.data

        if not body:
            return Response(data={"message": "Please provide a body for assignment which includes a request ID and an owner ID."}, status=status.HTTP_400_BAD_REQUEST)
        
        request_id = body.get("request")
        owner_id = body.get("owner")

        if not request_id:
            return Response(data={"message": "Please provide a request ID for assignment."}, status=status.HTTP_400_BAD_REQUEST)

        if not owner_id:
            return Response(data={"message": "Please provide an owner ID for assignment."}, status=status.HTTP_400_BAD_REQUEST)
        
        actionable_requests = BaseUserAwareRequest(request=self.request).get_queryset()

        ta_request = None
        try:
            ta_request = Request.objects.get(pk=request_id)
        except Request.DoesNotExist:
            return Response(data={"message": "A request with given ID does not exist."}, status=status.HTTP_400_BAD_REQUEST)

        if (not actionable_requests) or (not actionable_requests.filter(id=request_id)):  
            return Response(data={"message": "Request is not actionable for the current user identity."}, status=status.HTTP_400_BAD_REQUEST)

        if (owner_id):
            possible_owners = OwnerListView(request=self.request).get_queryset()

            new_owner = None
            try:
                new_owner = Owner.objects.get(pk=owner_id)
            except Owner.DoesNotExist:
                return Response(data={"message": "Owner with given ID does not exist."}, status=status.HTTP_400_BAD_REQUEST)

            if (not possible_owners) or (not possible_owners.filter(id=owner_id)):
                print(owner_id)
                print(possible_owners)
                return Response(data={"message": "Current user identity cannot assign to that owner."}, status=status.HTTP_400_BAD_REQUEST)
        
            try:
                match new_owner.domain_type:
                    case DOMAINTYPE.RECEPTION:
                        ta_request.owner = new_owner                    
                        # Resetting prior assignments if request kicked back to Reception
                        ta_request.program = None
                        ta_request.lab = None
                        ta_request.expert = None

                    case DOMAINTYPE.PROGRAM:
                        ta_request.owner = new_owner
                        ta_request.program = new_owner.program

                    case DOMAINTYPE.LAB:
                        ta_request.owner = new_owner
                        ta_request.lab = new_owner.lab

                    case DOMAINTYPE.EXPERT:
                        if not (IsAdmin().has_permission(request) or IsLabLead().has_permission(request)):
                            return Response(data={"message": "Insufficient privilege to assign an expert."}, status=status.HTTP_401_UNAUTHORIZED)
                        ta_request.owner = new_owner
                        ta_request.expert = new_owner.expert
                    
                    case _:
                        return Response(data={"message": "Given request's domaintype is invalid"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                with transaction.atomic():
                    ta_request.save()
                    create_audit_history(request, ta_request, ActionType.Assignment, f"Assigned to {str(new_owner)} as {new_owner.domain_type}")

            except Exception as e:
                return Response(data={"message": f"{e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(status=status.HTTP_200_OK)
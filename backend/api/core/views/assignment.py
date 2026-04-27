from rest_framework import views, status, authentication, permissions
from rest_framework.response import Response
from django.db import transaction

from allauth.headless.contrib.rest_framework.authentication import (
    XSessionTokenAuthentication,
)

from core.utils import create_audit_history, get_status
from core.permissions import IsAdmin, IsLabLead, IsProgramLead
from core.views.owner import OwnerListView
from core.models import *
from core.models.audit_history import ActionType
from core.constants import DOMAINTYPE, REQUEST_STATUS

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
        
        actionable_requests = BaseUserAwareRequest(request=self.request).get_actionable()

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
                return Response(data={"message": "Current user identity cannot assign to that owner."}, status=status.HTTP_400_BAD_REQUEST)

            try:
                match new_owner.domain_type:
                    case DOMAINTYPE.RECEPTION:
                        ta_request.owner = new_owner                    
                        # Resetting prior assignments if request kicked back to Reception
                        ta_request.program = None
                        ta_request.lab = None
                        ta_request.expert = None

                        # Request is being kicked back to reception from program
                        if ta_request.status.name in [REQUEST_STATUS.ASSIGNED_TO_PROGRAM, REQUEST_STATUS.REJECTED_BY_LAB]:
                            ta_request.status = get_status(REQUEST_STATUS.REJECTED_BY_PROGRAM)
                        # Request is being assigned to reception for the first time or being reopened
                        else:
                            ta_request.status = get_status(REQUEST_STATUS.SCOPING)
                    case DOMAINTYPE.PROGRAM:
                        ta_request.owner = new_owner
                        ta_request.program = new_owner.program
                        
                        # Request is being kicked back to the program from the lab
                        if ta_request.status.name in [REQUEST_STATUS.ASSIGNED_TO_LAB, REQUEST_STATUS.REJECTED_BY_EXPERT]:
                            ta_request.status = get_status(REQUEST_STATUS.REJECTED_BY_LAB)
                            ta_request.lab = None
                        # Request is being forwarded to the program from the lab after reviewing closeout
                        elif ta_request.status.name == REQUEST_STATUS.CLOSEOUT_REVIEW_BY_LAB:
                            ta_request.status = get_status(REQUEST_STATUS.CLOSEOUT_REVIEW_BY_PROGRAM)
                        # Request is being assigned to program for the first time
                        else:
                            ta_request.status = get_status(REQUEST_STATUS.ASSIGNED_TO_PROGRAM)

                    case DOMAINTYPE.LAB:
                        ta_request.owner = new_owner
                        ta_request.lab = new_owner.lab
                        
                        # Request is being assigned to lab for the first time
                        if ta_request.status.name in [REQUEST_STATUS.ASSIGNED_TO_PROGRAM, REQUEST_STATUS.REJECTED_BY_LAB]:
                            ta_request.status = get_status(REQUEST_STATUS.ASSIGNED_TO_LAB)
                            ta_request.expert = None
                        # Request is being kicked back to lab from expert
                        elif ta_request.status.name in [REQUEST_STATUS.ASSIGNED_TO_EXPERT, REQUEST_STATUS.PROVIDING_TA]:
                            ta_request.status = get_status(REQUEST_STATUS.REJECTED_BY_EXPERT)
                            ta_request.expert = None
                        # Request is being forwarded to the lab from the expert after finishing closeout
                        elif ta_request.status.name in [REQUEST_STATUS.CLOSEOUT_STARTED, REQUEST_STATUS.CLOSEOUT_MORE_INFO]:
                            ta_request.status = get_status(REQUEST_STATUS.CLOSEOUT_REVIEW_BY_LAB)
                        
                    case DOMAINTYPE.EXPERT:
                        if not (IsAdmin().has_permission(request) or IsLabLead().has_permission(request) or IsProgramLead().has_permission(request)):
                            return Response(data={"message": "Insufficient privilege to assign an expert."}, status=status.HTTP_401_UNAUTHORIZED)
                        ta_request.owner = new_owner
                        ta_request.expert = new_owner.expert

                        # Request is being assigned to expert for the first time
                        if ta_request.status.name in [REQUEST_STATUS.ASSIGNED_TO_LAB, REQUEST_STATUS.REJECTED_BY_EXPERT]:
                            ta_request.status = get_status(REQUEST_STATUS.ASSIGNED_TO_EXPERT)
                        # Request is being kicked back to expert by lab or program during closeout review
                        elif ta_request.status.name in [REQUEST_STATUS.CLOSEOUT_REVIEW_BY_LAB, REQUEST_STATUS.CLOSEOUT_REVIEW_BY_PROGRAM]:
                            ta_request.status = get_status(REQUEST_STATUS.CLOSEOUT_MORE_INFO)
                            closeout_form = ta_request.closeout_form
                            if closeout_form:
                                closeout_form.submitted_date = None
                                closeout_form.approved_by_lab = False
                                closeout_form.approved_by_program = False

                    case _:
                        return Response(data={"message": "Given request's domaintype is invalid"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                with transaction.atomic():
                    if closeout_form:
                        closeout_form.save()
                    ta_request.save()
                    create_audit_history(request, ta_request, ActionType.Assignment, f"Assigned to {str(new_owner)} as {new_owner.domain_type}")

            except Exception as e:
                return Response(data={"message": f"{e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(status=status.HTTP_200_OK)
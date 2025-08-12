from rest_framework import views, status, authentication, permissions
from rest_framework.response import Response
from django.db import transaction

from allauth.headless.contrib.rest_framework.authentication import (
    XSessionTokenAuthentication,
)

from core.util.notifications import send_email_notification
from core.util.email_prompts import generic_template
from core.permissions import IsAdmin, IsLabLead
from core.views.owner import OwnerListView
from core.models import *
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
        expert_id = body.get("expert")

        if not request_id:
            return Response(data={"message": "Please provide a request ID for assignment."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Can have only owner, or expert given. Not both. 
        if not (bool(owner_id) ^ bool(expert_id)):
            return Response(data={"message": "Please provide only owner ID or an expert ID for assignment, not both."}, status=status.HTTP_400_BAD_REQUEST)

        if not owner_id and not expert_id:
            return Response(data={"message": "Please provide at least an owner ID or an expert ID for assignment."}, status=status.HTTP_400_BAD_REQUEST)
        
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
                return Response(data={"message": "Current user identity cannot assign to that owner."}, status=status.HTTP_400_BAD_REQUEST)
        
            try:
                match new_owner.domain_type:
                    case DOMAINTYPE.RECEPTION:
                        ta_request.owner = new_owner
                        ta_request.expert = None
                        
                        # Resetting receipt if request kicked back
                        ta_request.receipt.program = None
                        ta_request.receipt.lab = None
                        ta_request.receipt.expert = None
                        
                        # Who do we send notfication to
                        reception_assignments = ReceptionRoleAssignment.objects.filter(role=Role.objects.get(name=ROLE.COORDINATOR))
                        receipients = [assignment.user.email for assignment in reception_assignments] 

                    case DOMAINTYPE.PROGRAM:
                        ta_request.owner = new_owner
                        ta_request.expert = None

                        ta_request.receipt.program = new_owner.program

                        # Who do we send notfication to
                        program_assignments = ProgramRoleAssignment.objects.filter(role=Role.objects.get(name=ROLE.PROGRAM_LEAD))
                        receipients = [assignment.user.email for assignment in program_assignments] 

                    case DOMAINTYPE.LAB:
                        ta_request.owner = new_owner
                        ta_request.expert = None

                        ta_request.receipt.lab = new_owner.lab

                        # Who do we send notfication to
                        lab_assignments = LabRoleAssignment.objects.filter(role=Role.objects.get(name=ROLE.LAB_LEAD))
                        receipients = [assignment.user.email for assignment in lab_assignments] 
                    
                    # Should never happen!!
                    case _:
                        return Response(data={"message": "Given request's domaintype is invalid"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                with transaction.atomic():
                    ta_request.save()
                    ta_request.receipt.save()

            except Exception as e:
                return Response(data={"message": f"{e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if (expert_id):
            if not(IsAdmin().has_permission(request) or IsLabLead().has_permission(request)):
                return Response(data={"message": "Insufficient privillege to assign expert for given request"}, status=status.HTTP_401_UNAUTHORIZED)

            expert = None
            try:
                expert = User.objects.get(pk=expert_id)
            except User.DoesNotExist:
                return Response(data={"message": "Expert with given ID does not exist."}, status=status.HTTP_400_BAD_REQUEST)

            if not ta_request.owner.domain_type == DOMAINTYPE.LAB:
                return Response(data={"message": "Can only assign expert when given request is owned by a lab."}, status=status.HTTP_400_BAD_REQUEST)
            
            # Make sure that expert is part of current lab for the program associated with given request
            try: 
                LabRoleAssignment.objects.get(user=expert, role=Role.objects.get(name=ROLE.EXPERT), instance=ta_request.owner.lab, program=ta_request.receipt.program)
            except LabRoleAssignment.DoesNotExist:
                return Response(data={"message": "Given expert is not valid in the context of the given request's assigned lab."}, status=status.HTTP_400_BAD_REQUEST)
            
            ta_request.expert = expert
            ta_request.receipt.expert = expert
            
            # Who do we send notification to
            receipients = [expert.email]
            
            try:
                with transaction.atomic():
                    ta_request.receipt.save()
                    ta_request.save()
            except:
                return Response(data={"message": f"{e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        send_email_notification("TACONNECT Assignment Notification", generic_template(User.objects.get(pk=self.request.user.id).name.split(" ")[0], f"You have received this email because {ta_request} has been assigned to {"you in " if expert_id else ""}{ta_request.owner.__str__().replace(" Owner", "")}."), receipients)
        
        return Response(status=status.HTTP_200_OK)
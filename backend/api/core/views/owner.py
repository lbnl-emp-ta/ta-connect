from rest_framework import status
from rest_framework.response import Response

from core.constants import DOMAINTYPE, REQUEST_STATUS, ROLE
from core.models import *
from core.permissions import *
from core.serializers import *
from core.views.request import BaseUserAwareRequest


class OwnerListView(BaseUserAwareRequest):
    def get_queryset(self, request_id):
        """
        Returns all Owners that the current user is allowed to assign to.
        This is its own method so that it can be used in both GET requests and
        assignment requests (where it validates owner assignment permission).
        """
        ta_request, err = self.get_request_or_error(Request.objects.all(), request_id)
        if err:
            return err
        
        owners_set = Owner.objects.all()
        allowed_owners = owners_set.none()

        if IsAdmin().has_permission(self.request, self):
            return owners_set

        if ta_request.status.name == REQUEST_STATUS.SCOPING and IsCoordinator().has_permission(self.request, self):
            return owners_set.filter(domain_type=DOMAINTYPE.PROGRAM)
        
        if ta_request.status.name in [REQUEST_STATUS.ASSIGNED_TO_PROGRAM, REQUEST_STATUS.REJECTED_BY_LAB] and IsProgramLead().has_object_permission(self.request, self, ta_request):
            # Backwards
            reception_owners = owners_set.filter(domain_type=DOMAINTYPE.RECEPTION)
            allowed_owners = allowed_owners | reception_owners
            # Forwards
            for lab in ta_request.program.labs.all():
                allowed_owners = allowed_owners | Owner.objects.filter(pk=lab.owner.pk)

        if ta_request.status.name in [REQUEST_STATUS.ASSIGNED_TO_LAB, REQUEST_STATUS.REJECTED_BY_EXPERT] and IsLabLead().has_object_permission(self.request, self, ta_request):
            # Backwards
            program_owners = owners_set.filter(domain_type=DOMAINTYPE.PROGRAM, program=ta_request.program)
            # Forwards
            experts_in_lab = LabRoleAssignment.objects.filter(
                role=Role.objects.get(name=ROLE.EXPERT),
                instance=ta_request.lab,
                program=ta_request.program,
            ).values_list('user', flat=True)
            expert_owners = owners_set.filter(domain_type=DOMAINTYPE.EXPERT, expert__in=experts_in_lab)
            allowed_owners = allowed_owners | program_owners | expert_owners

        return allowed_owners.distinct()
        # if ta_request.status.name in [REQUEST_STATUS.ASSIGNED_TO_LAB, REQUEST_STATUS.REJECTED_BY_EXPERT]:

        # if ta_request.status.name in [REQUEST_STATUS.CLOSEOUT_REVIEW_BY_PROGRAM]:
        #     expert_users = expert_users | LabRoleAssignment.objects.filter(
        #         role=Role.objects.get(name=ROLE.EXPERT),
        #         instance=lab,
        #         program=program,
        #     ).values_list('user', flat=True)
        
        # program_assignments = ProgramRoleAssignment.objects.filter(user=user)
        # lab_assignments = LabRoleAssignment.objects.filter(user=user)

        # for assignment in program_assignments:
        #     program = assignment.instance
        #     lab_owners = owners_set.none()
        #     expert_users = User.objects.none()
        #     for lab in program.labs.all():
        #         if ta_request.status.name in [REQUEST_STATUS.ASSIGNED_TO_PROGRAM, REQUEST_STATUS.REJECTED_BY_LAB]:
        #             lab_owners = lab_owners | Owner.objects.filter(pk=lab.owner.pk)
        #         if ta_request.status.name in [REQUEST_STATUS.CLOSEOUT_REVIEW_BY_PROGRAM]:
        #             expert_users = expert_users | LabRoleAssignment.objects.filter(
        #                 role=Role.objects.get(name=ROLE.EXPERT),
        #                 instance=lab,
        #                 program=program,
        #             ).values_list('user', flat=True)

        #     expert_owners = owners_set.filter(domain_type=DOMAINTYPE.EXPERT, expert__in=expert_users)
        #     reception_owners = owners_set.filter(domain_type=DOMAINTYPE.RECEPTION)
        #     allowed_owners = allowed_owners | reception_owners | lab_owners | expert_owners

        # for assignment in lab_assignments:
        #     if assignment.role.name == ROLE.LAB_LEAD:
        #         expert_users = LabRoleAssignment.objects.filter(
        #             role=Role.objects.get(name=ROLE.EXPERT),
        #             instance=assignment.instance,
        #             program=assignment.program,
        #         ).values_list('user', flat=True)

        #         allowed_owners = allowed_owners | owners_set.filter(
        #             Q(domain_type=DOMAINTYPE.PROGRAM, program=assignment.program) |
        #             Q(domain_type=DOMAINTYPE.EXPERT, expert__in=expert_users)
        #         )
        #     elif assignment.role.name == ROLE.EXPERT:
        #         allowed_owners = allowed_owners | owners_set.filter(domain_type=DOMAINTYPE.LAB, lab=assignment.instance)

        # return allowed_owners.distinct()
    
    def get(self, request, request_id, format=None):
        queryset = self.get_queryset(request_id)

        # Need to format owners one at a time to include domain-specific information
        # This could potentially be refactored at the serializer level to avoid the loop here
        owners_data = []
        for owner in queryset.all():
            owners_data.append(OwnerSerializer().format_owner(owner))

        return Response(data=owners_data, status=status.HTTP_200_OK)
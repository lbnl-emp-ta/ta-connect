from django.db.models import Q
from rest_framework import views, status, permissions, authentication
from rest_framework.response import Response

from allauth.headless.contrib.rest_framework.authentication import (
    XSessionTokenAuthentication,
)

from core.serializers import *
from core.permissions import *
from core.models import *
from core.constants import DOMAINTYPE, ROLE

class OwnerListView(views.APIView):
    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def get_queryset(self):
        """
        Returns all Owners that the current user is allowed to assign to.
        This is its own method so that it can be used in both GET requests and
        assignment requests (where it validates owner assignment permission).
        """
        queryset = Owner.objects.all()

        if IsAdmin().has_permission(self.request, self):
            return queryset

        if IsCoordinator().has_permission(self.request, self):
            return queryset.filter(domain_type=DOMAINTYPE.PROGRAM)
        
        allowed_owners = queryset.none()
        user = User.objects.get(pk=self.request.user.id)
        program_assignments = ProgramRoleAssignment.objects.filter(user=user)
        lab_assignments = LabRoleAssignment.objects.filter(user=user)

        for assignment in program_assignments:
            program = assignment.instance
            lab_owners = queryset.none()
            expert_users = User.objects.none()
            for lab in program.labs.all():
                lab_owners = lab_owners | Owner.objects.filter(pk=lab.owner.pk)
                expert_users = expert_users | LabRoleAssignment.objects.filter(
                    role=Role.objects.get(name=ROLE.EXPERT),
                    instance=lab,
                    program=program,
                ).values_list('user', flat=True)

            expert_owners = queryset.filter(domain_type=DOMAINTYPE.EXPERT, expert__in=expert_users)
            reception_owners = queryset.filter(domain_type=DOMAINTYPE.RECEPTION)
            allowed_owners = allowed_owners | reception_owners | lab_owners | expert_owners

        for assignment in lab_assignments:
            if assignment.role.name == ROLE.LAB_LEAD:
                expert_users = LabRoleAssignment.objects.filter(
                    role=Role.objects.get(name=ROLE.EXPERT),
                    instance=assignment.instance,
                    program=assignment.program,
                ).values_list('user', flat=True)

                allowed_owners = allowed_owners | queryset.filter(
                    Q(domain_type=DOMAINTYPE.PROGRAM, program=assignment.program) |
                    Q(domain_type=DOMAINTYPE.EXPERT, expert__in=expert_users)
                )
            elif assignment.role.name == ROLE.EXPERT:
                allowed_owners = allowed_owners | queryset.filter(domain_type=DOMAINTYPE.LAB, lab=assignment.instance)

        return allowed_owners.distinct()
    
    def get(self, request, format=None):
        queryset = self.get_queryset()

        # Need to format owners one at a time to include domain-specific information
        # This could potentially be refactored at the serializer level to avoid the loop here
        owners_data = list()
        for owner in queryset.all():
            owners_data.append(OwnerSerializer().format_owner(owner))

        return Response(data=owners_data, status=status.HTTP_200_OK)
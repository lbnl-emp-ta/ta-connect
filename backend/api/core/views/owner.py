from rest_framework import views, status, permissions, authentication
from rest_framework.response import Response

from allauth.headless.contrib.rest_framework.authentication import (
    XSessionTokenAuthentication,
)

from core.serializers import *
from core.permissions import *
from core.models import *
from core.constants import DOMAINTYPE

class OwnerListView(views.APIView):
    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def get_queryset(self):
        queryset = Owner.objects.all()

        maybe_context = self.request.headers.get("Context")
        if maybe_context is None:
            return queryset.none()

        context = json.loads(maybe_context)

        if IsAdmin().has_permission(self.request, self):
            return queryset

        if IsCoordinator().has_permission(self.request, self):
            # See one layer down to programs
            return queryset.filter(domain_type=DOMAINTYPE.PROGRAM)

        if IsProgramLead().has_permission(self.request, self):
            # if we get here, it means "instance" field must be valid so no need to check
            program = Program.objects.get(pk=context.get("instance"))

            lab_owners = queryset.none() 
            for lab in program.labs.all():
                lab_owners = lab_owners | Owner.objects.filter(pk=lab.owner.pk)

            # See one layer back up to reception, and one layer down to associated labs 
            return queryset.filter(domain_type=DOMAINTYPE.RECEPTION) | lab_owners 


        if IsLabLead().has_permission(self.request, self):
            assignment = LabRoleAssignment.objects.get(user=User.objects.get(pk=context.get("user")), role=Role.objects.get(pk=context.get("role")), instance=Lab.objects.get(pk=context.get("instance")))

            # Only one layer up, Experts are a role within Labs - not another layer
            return Owner.objects.filter(domain_type=DOMAINTYPE.PROGRAM, program=assignment.program)
        
        return queryset.none()
    
    def get(self, request, format=None):
        queryset = self.get_queryset()

        owners_data = list()
        for owner in queryset.all():
            owners_data.append(OwnerSerializer().format_owner(owner))

        return Response(data=owners_data, status=status.HTTP_200_OK)
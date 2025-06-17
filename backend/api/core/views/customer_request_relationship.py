from rest_framework import generics, authentication, permissions

from core.models import *
from core.serializers import CustomerRequestRelationshipSerializer
from core.permissions import *

from allauth.headless.contrib.rest_framework.authentication import (
    XSessionTokenAuthentication,
)

class CustomerRequestRelationshipListCreateView(generics.ListCreateAPIView):
    serializer_class = CustomerRequestRelationshipSerializer

    def get_queryset(self):
        queryset = CustomerRequestRelationship.objects.all()

        if (IsAdmin().has_permission(self.request, self)):
            return queryset

        # filter based on search params (user, role, location, program)
        context = json.loads(self.request.headers.get("Context"))

        user = User.objects.filter(pk=context.get("user")).first()
        if (not user):
            return queryset.none() 

        reception_assignments = ReceptionRoleAssignment.objects.filter(user=user)
        program_assignments = ProgramRoleAssignment.objects.filter(user=user)
        lab_assignments = LabRoleAssignment.objects.filter(user=user)
        
        # (instance, role) 

        return queryset 

    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
    ]
from allauth.headless.contrib.rest_framework.authentication import (
    XSessionTokenAuthentication,
)
from rest_framework import authentication, permissions, status, views
from rest_framework.response import Response

from core.constants import ROLE
from core.models import *
from core.serializers import *


# role, location, instance
class IdentityListView(views.APIView):
    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def get(self, request, format=None):
        user = User.objects.get(pk=self.request.user.id)

        system_role_assignments = SystemRoleAssignment.objects.filter(user=user)
        reception_assignments = ReceptionRoleAssignment.objects.filter(user=user)
        program_assignments = ProgramRoleAssignment.objects.filter(user=user)
        lab_assignments = LabRoleAssignment.objects.filter(user=user)

        identities = list()

        for assignment in system_role_assignments:
            identity = dict()
            identity["assignment_id"] = assignment.id
            identity["user"] = {"id": user.pk, "email": user.email}
            identity["location"] = "system"
            identity["role"] = RoleSerializer(assignment.role).data
            identities.append(identity)

        for assignment in reception_assignments:
            identity = dict()
            identity["assignment_id"] = assignment.id
            identity["user"] = {"id": user.pk, "email": user.email}
            identity["location"] = "reception"
            identity["role"] = RoleSerializer(assignment.role).data 
            identities.append(identity)
            
        for assignment in program_assignments:
            identity = dict()
            identity["assignment_id"] = assignment.id
            identity["user"] = {"id": user.pk, "email": user.email}
            identity["location"] = "program"
            identity["instance"] = ProgramSerializer(assignment.instance).data
            identity["role"] = RoleSerializer(assignment.role).data 
            identities.append(identity)
            
        for assignment in lab_assignments:
            identity = dict()
            identity["assignment_id"] = assignment.id
            identity["user"] = {"id": user.pk, "email": user.email}
            identity["location"] = "lab"
            identity["instance"] = LabSerializer(assignment.instance).data
            identity["program"] = ProgramSerializer(assignment.program).data
            identity["role"] = RoleSerializer(assignment.role).data 
            if assignment.role.name == ROLE.EXPERT:
                identity["expertises"] = [ExpertiseSerializer(expertise).data for expertise in assignment.expertises.all()]
            identities.append(identity)
        
        if not identities:
            return Response(data={"message", "No identities for logged in user found."}, status=status.HTTP_204_NO_CONTENT)

        return Response(data=identities, status=status.HTTP_200_OK) 

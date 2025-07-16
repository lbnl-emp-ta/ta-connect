import json

from rest_framework import views, status, authentication, permissions
from rest_framework.response import Response

from core.models import *
from core.serializers import *
from core.permissions import *
from core.constants import ROLE

from allauth.headless.contrib.rest_framework.authentication import (
    XSessionTokenAuthentication,
)

class ExpertsListView(views.APIView):
    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def get(self, request, lab_name=None, format=None):
        if lab_name is None:
            return Response(data={"message": "Please provide a lab name parameter with request"}, status=status.HTTP_400_BAD_REQUEST)
        
        maybe_lab = None
        try:
            maybe_lab = Lab.objects.get(name=lab_name)
        except Lab.DoesNotExist:
            return Response(data={"message": "Lab with provided name does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        if not (IsLabLead().has_permission(request) or IsAdmin().has_permission(request)):
            return Response(data={"message": "Insufficient credentials to access experts"}, status=status.HTTP_400_BAD_REQUEST)

        # Program agnostic for now, might consider changing in future! 
        expert_assignments = LabRoleAssignment.objects.filter(role=Role.objects.get(ROLE.EXPERT), instance=maybe_lab)
        experts_data = list()
        for assignment in expert_assignments:
            data = dict()
            data["id"] = assignment.user.pk
            data["name"] = assignment.user.name
            data["email"] = assignment.user.email

            expertise_list = Expertise.objects.filter(user=assignment.user.pk)
            expertise = dict()
            for expertise_entry in expertise_list:
                expertise["topic"] = TopicSerializer(data=Topic.objects.get(pk=expertise_entry.topic)).validated_data
                expertise["depth"] = DepthSerializer(data=Depth.objects.get(pk=expertise_entry.depth)).validated_data

            data["expertise"] = expertise
            experts_data.append(data)
        
        return Response(data=experts_data, status=status.HTTP_200_OK)
import json

from rest_framework import views, status, authentication, permissions
from rest_framework.response import Response

from core.views.request import BaseUserAwareRequest
from core.models import *
from core.serializers import *
from core.permissions import *
from core.constants import ROLE, REQUEST_STATUS

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

    def get(self, request, format=None):
        # A(1/2): empty list so that...
        expert_assignments = list()
        if IsAdmin().has_permission(request):
            expert_assignments = LabRoleAssignment.objects.filter(role=Role.objects.get(name=ROLE.EXPERT))
        elif IsProgramLead().has_permission(request):
            maybe_context = self.request.headers.get("Context")
            if not maybe_context:
                return Response(data={"message": "Please include identity context with request"}, status=status.HTTP_400_BAD_REQUEST)

            context = json.loads(maybe_context) 
            try:
                expert_assignments = LabRoleAssignment.objects.filter(role=Role.objects.get(name=ROLE.EXPERT), program=Program.objects.get(pk=context.get("instance")))
            except Exception as e:
                return Response(data={"message": f"{e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        elif IsLabLead().has_permission(request):
            maybe_context = self.request.headers.get("Context")
            if not maybe_context:
                return Response(data={"message": "Please include identity context with request"}, status=status.HTTP_400_BAD_REQUEST)

            context = json.loads(maybe_context) 
            try:
                expert_assignments = LabRoleAssignment.objects.filter(role=Role.objects.get(name=ROLE.EXPERT), instance=Lab.objects.get(pk=context.get("instance")))
            except Exception as e:
                return Response(data={"message": f"{e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        experts_data = list()

        # A(2/2): ...this loop can fail gracefully
        for assignment in expert_assignments:
            expert_user = assignment.user
            expert_serializer = ExpertSerializer(expert_user)
            data = dict()
            data["id"] = expert_user.pk
            data["owner_id"] = expert_serializer.data.get("owner_id")
            data["name"] = expert_user.name
            data["email"] = expert_user.email
            data["lab"] = LabSerializer(assignment.instance).data

            expertise_list = list()
            expertise_entries = Expertise.objects.filter(user=expert_user.pk)
            for expertise_entry in expertise_entries:
                expertise = dict()
                maybe_topic = None
                maybe_depth = None
                try:
                    maybe_topic = Topic.objects.get(pk=expertise_entry.topic.pk)
                    maybe_depth = Depth.objects.get(pk=expertise_entry.depth.pk)
                except:
                    return Response(data={"message": "Topic/Depth internal error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                topic_serializer = TopicSerializer(maybe_topic)
                depth_serializer = DepthSerializer(maybe_depth)

                expertise["topic"] = topic_serializer.data
                expertise["depth"] = depth_serializer.data 
                expertise_list.append(expertise)

            data["expertises"] = expertise_list

            # expert_user = assignment.user
            expert_requests = Request.objects.filter(expert=expert_user)
            active_requests = expert_requests.exclude(owner=None)
            data["active_requests_count"] = active_requests.count()
            data["total_requests_count"] = expert_requests.count()

            experts_data.append(data)
        
        return Response(data=experts_data, status=status.HTTP_200_OK)
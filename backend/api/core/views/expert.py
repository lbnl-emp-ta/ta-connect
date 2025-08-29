import json

from rest_framework import views, status, authentication, permissions
from rest_framework.response import Response

from core.views.request import BaseUserAwareRequest
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

    def get(self, request, format=None):
        # A(1/2): empty list so that...
        expert_assignments = list()
        if IsAdmin().has_permission(request):
            expert_assignments = LabRoleAssignment.objects.filter(role=Role.objects.get(name=ROLE.EXPERT))
        elif IsLabLead().has_permission(request):
            maybe_context = self.request.headers.get("Context")
            if not maybe_context:
                return Response(data={"message": "Please include identity context with request"}, status=status.HTTP_400_BAD_REQUEST)

            context = json.loads(maybe_context) 
            try:
                expert_assignments = LabRoleAssignment.objects.filter(role=Role.objects.get(name=ROLE.EXPERT), instance=Lab.objects.get(pk=context.get("instance")))
            except Exception as e:
                return Response(data={"message": f"{e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response(data={"message": "Insufficient credentials to access experts"}, status=status.HTTP_400_BAD_REQUEST)

        experts_data = list()

        # A(2/2): ...this loop can fail gracefully
        for assignment in expert_assignments:
            data = dict()
            data["id"] = assignment.user.pk
            data["name"] = assignment.user.name
            data["email"] = assignment.user.email
            data["lab"] = LabSerializer(assignment.instance).data

            expertise_list = list()
            expertise_entries = Expertise.objects.filter(user=assignment.user.pk)
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

            request_data = RequestExpertListSerializer(Request.objects.filter(expert=User.objects.get(pk=self.request.user.id)), many=True).data
            data["requests"] = request_data

            experts_data.append(data)
        
        return Response(data=experts_data, status=status.HTTP_200_OK)
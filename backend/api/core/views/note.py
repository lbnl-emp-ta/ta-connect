from rest_framework import views, authentication, permissions, status
from rest_framework.response import Response

from core.models import Note, Request
from core.serializers import NoteSerializer
from core.views.request import BaseUserAwareRequest

from allauth.headless.contrib.rest_framework.authentication import (
    XSessionTokenAuthentication,
)

class NoteListView(views.APIView):
    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
    ]
    
    def get(self, request, request_id, format=None):
        try:
            request_obj = Request.objects.get(pk=request_id)
        except Request.DoesNotExist:
            return Response(data={"message": "Request with given ID does not exist"}, status=status.HTTP_501_NOT_IMPLEMENTED)
            
        base_user_request_obj = BaseUserAwareRequest(request=request)
        visible_request = base_user_request_obj.get_actionable() | base_user_request_obj.get_downstream()
        

        queryset = Note.objects.all().filter(request=request_obj)
        queryset = queryset.filter(request__in=visible_request)
        
        if not queryset.exists():
            return Response(data=list(), status=status.HTTP_204_NO_CONTENT)

        serializer = NoteSerializer(queryset, many=True)

        return Response(data=serializer.data, status=status.HTTP_200_OK)
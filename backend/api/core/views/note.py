from rest_framework import views, authentication, permissions, status
from rest_framework.response import Response

from permissions import IsAdmin
from core.models import Note, Request
from core.serializers import NoteSerializer, NoteCreateSerializer
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


class NoteCreateView(views.APIView):
    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
    ]
    
    def post(self, request, request_id):
        try:
            request_obj = Request.objects.get(pk=request_id)
        except Request.DoesNotExist:
            return Response(data={"message":"Request does not exist for given ID"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not BaseUserAwareRequest(request=request).get_actionable().contains(request_obj):
            return Response(data={"message": "Insufficient authorization to create note for given request"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not "author" in self.request.data:
            return Response(data={"message":"Missing required author field"}, status=status.HTTP_400_BAD_REQUEST)

        if not "request" in self.request.data:
            return Response(data={"message":"Missing required request field"}, status=status.HTTP_400_BAD_REQUEST)

        if not "content" in self.request.data:
            return Response(data={"message":"Missing required content field"}, status=status.HTTP_400_BAD_REQUEST)

        note_data = dict()
        note_data["author"] = self.request.data.get("author")
        note_data["request"] = self.request.data.get("request")
        note_data["content"] = self.request.data.get("content")
        
        serializer = NoteCreateSerializer(data=note_data)
        if not serializer.is_valid():
            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        response_note = serializer.save()

        return Response(data=(NoteSerializer(response_note)).data, status=status.HTTP_200_OK)


class NoteDeleteView(views.APIView):
    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
    ]
    
    def delete(self, request, request_id, note_id):
        try:
            Request.objects.get(pk=request_id)
        except Request.DoesNotExist:
            return Response(data={"message":"Request does not exist for given ID"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            note_obj = Note.objects.get(pk=note_id)
        except Note.DoesNotExist:
            return Response(data={"message":"Note with given ID does not exist"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not IsAdmin().has_permission(request):
            return Response(data={"message": "Insufficient authorization to delete note for given request"}, status=status.HTTP_400_BAD_REQUEST)

        note_obj.delete()

        return Response(data={"message": "Note deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
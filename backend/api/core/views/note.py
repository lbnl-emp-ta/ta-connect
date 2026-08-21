from rest_framework import permissions, status
from rest_framework.response import Response

from core.models import Note, Request
from core.models.audit_history import ActionType
from core.permissions import CanAddNote, CanDeleteNote
from core.serializers import NoteCreateSerializer, NoteSerializer
from core.utils import create_audit_history
from core.views.request import BaseUserAwareRequest


class NoteListView(BaseUserAwareRequest):
    permission_classes = [
        permissions.IsAuthenticated,
    ]
    
    def get(self, request, request_id, format=None):
        visible_requests = self.get_actionable() | self.get_downstream() | self.get_inactive()
        ta_request, err = self.get_request_or_error(visible_requests, request_id)
        if err:
            return err
            
        queryset = Note.objects.all().filter(request=ta_request)
        
        if not queryset.exists():
            return Response(data=[], status=status.HTTP_204_NO_CONTENT)

        serializer = NoteSerializer(queryset, many=True)

        return Response(data=serializer.data, status=status.HTTP_200_OK)


class NoteCreateView(BaseUserAwareRequest):
    permission_classes = [
        permissions.IsAuthenticated,
        CanAddNote,
    ]
    
    def post(self, request, request_id):
        ta_request, err = self.get_request_or_error(Request.objects.all(), request_id)
        if err:
            return err
        
        if not CanAddNote().has_object_permission(request, self, ta_request):
            return Response(data={"message": "Insufficient authorization to create note for given request"}, status=status.HTTP_403_FORBIDDEN)
        
        if not "author" in self.request.data:
            return Response(data={"message":"Missing required author field"}, status=status.HTTP_400_BAD_REQUEST)

        if not "request" in self.request.data:
            return Response(data={"message":"Missing required request field"}, status=status.HTTP_400_BAD_REQUEST)

        if not "content" in self.request.data:
            return Response(data={"message":"Missing required content field"}, status=status.HTTP_400_BAD_REQUEST)

        note_data = {}
        note_data["author"] = self.request.data.get("author")
        note_data["request"] = self.request.data.get("request")
        note_data["content"] = self.request.data.get("content")
        
        serializer = NoteCreateSerializer(data=note_data)
        if not serializer.is_valid():
            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        response_note = serializer.save()
        create_audit_history(request, ta_request, ActionType.AddNote, f"Added note: {response_note.content[:10]}...")

        return Response(data=(NoteSerializer(response_note)).data, status=status.HTTP_200_OK)


class NoteDeleteView(BaseUserAwareRequest):
    permission_classes = [
        permissions.IsAuthenticated,
        CanDeleteNote,
    ]
    
    def delete(self, request, request_id, note_id):
        ta_request, err = self.get_request_or_error(Request.objects.all(), request_id)
        if err:
            return err
        
        if not CanDeleteNote().has_object_permission(request, self, ta_request):
            return Response(data={"message": "Insufficient authorization to delete note for given request"}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            note_obj = Note.objects.get(pk=note_id)
        except Note.DoesNotExist:
            return Response(data={"message":"Note with given ID does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        note_obj.delete()
        create_audit_history(request, note_obj.request, ActionType.RemoveNote, f"Removed note: {note_obj.content[:10]}...")

        return Response(data={"message": "Note deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
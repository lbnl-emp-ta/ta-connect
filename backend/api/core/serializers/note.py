from rest_framework import serializers

from core.models import *

class NoteSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.name', read_only=True)

    class Meta:
        model = Note
        fields = ['id', 'author_name', 'request', 'content', 'timestamp']
    
class NoteCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['author', 'request', 'content']
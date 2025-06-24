from rest_framework import serializers

from core.models import *

class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program 
        fields = "__all__"
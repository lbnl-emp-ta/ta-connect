from rest_framework import serializers

from core.models import *

class LabSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lab 
        fields = "__all__"
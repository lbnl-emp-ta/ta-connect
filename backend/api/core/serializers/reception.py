from rest_framework import serializers

from core.models import *

class ReceptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reception
        fields = "__all__"
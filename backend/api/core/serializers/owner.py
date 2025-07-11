from rest_framework import serializers

from core.models import Owner
from core.serializers import * 

class OwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Owner
        fields = "__all__"
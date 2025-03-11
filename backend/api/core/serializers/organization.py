from rest_framework import serializers

from core.models import Organization
from core.serializers import OrganizationTypeSerializer

class OrganizationSerializer(serializers.ModelSerializer):
    type = OrganizationTypeSerializer()
    
    class Meta:
        model = Organization
        fields = "__all__"
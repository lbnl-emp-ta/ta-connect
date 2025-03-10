from rest_framework import serializers

from core.models import OrganizationType

class OrganizationTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationType
        fields = "__all__"
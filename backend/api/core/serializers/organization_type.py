from rest_framework import serializers

from core.models import OrganizationType

class OrganizationTypeSerializer(serializers.ModelField):
    class Meta:
        model = OrganizationType
        fields = "__all__"
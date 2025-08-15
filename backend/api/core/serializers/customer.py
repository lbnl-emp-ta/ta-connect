from rest_framework import serializers

from core.models import *
from core.serializers import * 

class CustomerSerializer(serializers.ModelSerializer):
    org = OrganizationSerializer()
    state = StateSerializer()
    tpr = TransmissionPlanningRegionSerializer() 

    class Meta:
        model = Customer
        fields = "__all__"

class CustomerEditSerializer(serializers.ModelSerializer):
    org = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all(), required=False)
    state = serializers.PrimaryKeyRelatedField(queryset=State.objects.all(), required=False)
    tpr = serializers.PrimaryKeyRelatedField(queryset=TransmissionPlanningRegion.objects.all(), required=False)
    email = serializers.EmailField(max_length=256, required=False, allow_null=True)
    name = serializers.CharField(max_length=256, required=False, allow_null=True)
    phone = serializers.CharField(max_length=64, required=False, allow_null=True)
    title = serializers.CharField(max_length=256, required=False, allow_null=True)

    class Meta:
        model = Customer
        fields = "__all__"
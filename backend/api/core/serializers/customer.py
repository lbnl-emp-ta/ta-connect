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
    orgType = serializers.PrimaryKeyRelatedField(queryset=OrganizationType.objects.all(), required=False)
    state = serializers.PrimaryKeyRelatedField(queryset=State.objects.all(), required=False)
    tpr = serializers.PrimaryKeyRelatedField(queryset=TransmissionPlanningRegion.objects.all(), required=False)
    email = serializers.EmailField(max_length=256, required=False, allow_null=True)
    name = serializers.CharField(max_length=256, required=False, allow_null=True)
    phone = serializers.CharField(max_length=64, required=False, allow_null=True)
    title = serializers.CharField(max_length=256, required=False, allow_null=True)

    class Meta:
        model = Customer
        fields = "__all__"

    def update(self, instance, validated_data):
        # Handle potential change of the related Organization object
        org = validated_data.pop('org', None)
        # Handle potential change to the Organization's type
        org_type = validated_data.pop('orgType', None)

        # If the organization itself is being changed, assign it first
        if org is not None:
            instance.org = org
            instance.save(update_fields=['org'])

        # If an orgType was provided, apply it to the relevant Organization
        if org_type is not None:
            target_org = instance.org
            if target_org is not None:
                target_org.type = org_type
                target_org.save(update_fields=['type'])

        # Let the base implementation update remaining Customer fields
        return super().update(instance, validated_data)
from rest_framework import serializers

from core.models import Customer
from core.serializers import * 

class CustomerSerializer(serializers.ModelSerializer):
    org = OrganizationSerializer()
    state = StateSerializer()
    tpr = TransmissionPlanningRegionSerializer() 

    class Meta:
        model = Customer
        fields = "__all__"
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

class CustomerDetailSerializer(serializers.Serializer):
    org = OrganizationSerializer()
    state = StateSerializer()
    tpr = TransmissionPlanningRegionSerializer() 
    email = serializers.EmailField(max_length=256, unique=True)
    name = serializers.CharField(max_length=256)
    phone = serializers.CharField(max_length=64, verbose_name="phone number", default=None)
    title = serializers.CharField(max_length=256, verbose_name="job title")

    type = CustomerTypeSerializer()
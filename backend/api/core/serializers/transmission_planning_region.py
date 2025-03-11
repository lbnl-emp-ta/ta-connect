from rest_framework import serializers
from core.models import TransmissionPlanningRegion

class TransmissionPlanningRegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransmissionPlanningRegion
        fields = "__all__"
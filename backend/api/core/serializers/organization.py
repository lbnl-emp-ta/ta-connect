from rest_framework import serializers

from core.models import Organization, State, TransmissionPlanningRegion

from .organization_type import OrganizationTypeSerializer
from .state import StateSerializer
from .transmission_planning_region import TransmissionPlanningRegionSerializer


class OrganizationSerializer(serializers.ModelSerializer):
    state = StateSerializer()
    transmission_planning_region = TransmissionPlanningRegionSerializer()
    type = OrganizationTypeSerializer()
    active_requests_count = serializers.SerializerMethodField()
    total_requests_count = serializers.SerializerMethodField()

    def get_active_requests_count(self, obj):
        return obj.requests.exclude(owner=None).count()

    def get_total_requests_count(self, obj):
        return obj.requests.count()

    class Meta:
        model = Organization
        fields = "__all__"


class OrganizationEditSerializer(serializers.ModelSerializer):
    name = serializers.CharField(max_length=256, required=False)
    address = serializers.CharField(max_length=512, required=False)
    transmission_planning_region = serializers.PrimaryKeyRelatedField(queryset=TransmissionPlanningRegion.objects.all(), required=False)
    state = serializers.PrimaryKeyRelatedField(queryset=State.objects.all(), required=False)

    class Meta:
        model = Organization
        fields = "__all__"

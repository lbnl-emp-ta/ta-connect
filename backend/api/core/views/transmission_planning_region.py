from rest_framework import generics
from core.models import TransmissionPlanningRegion
from core.serializers import TransmissionPlanningRegionSerializer

class TransmissionPlanningRegionListView(generics.ListAPIView):
    queryset = TransmissionPlanningRegion.objects.all()
    serializer_class = TransmissionPlanningRegionSerializer
    
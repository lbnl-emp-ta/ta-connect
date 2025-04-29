from rest_framework import generics

from core.models import Organization
from core.serializers import OrganizationSerializer

class OrganizationListCreateView(generics.ListCreateAPIView):
    queryset = Organization.objects.select_related("type")
    serializer_class = OrganizationSerializer
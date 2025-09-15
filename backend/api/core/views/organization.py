from rest_framework import generics

from core.models import Organization
from core.serializers import OrganizationSerializer

class OrganizationListView(generics.ListAPIView):
    queryset = Organization.objects.select_related("type")
    serializer_class = OrganizationSerializer
from rest_framework.generics import ListAPIView

from core.models import OrganizationType
from core.serializers import OrganizationTypeSerializer

class OrganizationTypeListView(ListAPIView):
    queryset = OrganizationType.objects.all()
    serializer_class = OrganizationTypeSerializer
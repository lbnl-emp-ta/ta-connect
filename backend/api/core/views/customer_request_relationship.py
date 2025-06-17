from rest_framework import generics

from core.models import CustomerRequestRelationship
from core.serializers import CustomerRequestRelationshipSerializer

class CustomerRequestRelationshipListCreateView(generics.ListCreateAPIView):
    queryset = CustomerRequestRelationship.objects.all()
    serializer_class = CustomerRequestRelationshipSerializer
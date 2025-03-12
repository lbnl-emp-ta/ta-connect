from rest_framework import generics

from core.models import CustomerRequestRelationship
from core.serializers import CustomerRequestRelationshipSerializer

class CustomerRequestRelationshipCreateView(generics.CreateAPIView):
    queryset = CustomerRequestRelationship.objects.all()
    serializer_class = CustomerRequestRelationshipSerializer
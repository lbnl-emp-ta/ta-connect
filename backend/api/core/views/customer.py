from rest_framework import generics

from core.models import Customer
from core.serializers import CustomerSerializer

class CustomerCreateView(generics.CreateAPIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
from rest_framework import generics, authentication, permissions

from core.models import *
from core.serializers import CustomerRequestRelationshipSerializer
from core.permissions import *

from allauth.headless.contrib.rest_framework.authentication import (
    XSessionTokenAuthentication,
)

class CustomerRequestRelationshipListCreateView(generics.ListCreateAPIView):
    queryset = CustomerRequestRelationship.objects.all()
    serializer_class = CustomerRequestRelationshipSerializer

    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
    ]
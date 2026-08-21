from allauth.headless.contrib.rest_framework.authentication import (
    XSessionTokenAuthentication,
)
from rest_framework import authentication, generics, permissions

from core.models import *
from core.permissions import *
from core.serializers import CustomerRequestRelationshipSerializer


class CustomerRequestRelationshipListView(generics.ListAPIView):
    queryset = CustomerRequestRelationship.objects.all()
    serializer_class = CustomerRequestRelationshipSerializer

    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
        (IsAdmin | IsCoordinator | IsProgramLead | IsLabLead | IsExpert),
    ]

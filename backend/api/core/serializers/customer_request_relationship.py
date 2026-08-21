from allauth.headless.contrib.rest_framework.authentication import (
    XSessionTokenAuthentication,
)
from rest_framework import authentication, permissions, serializers

from core.models import CustomerRequestRelationship
from core.serializers import *


class CustomerRequestRelationshipSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer()
    request = RequestSerializer()

    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
    ]

    class Meta:
        model = CustomerRequestRelationship
        fields = "__all__"
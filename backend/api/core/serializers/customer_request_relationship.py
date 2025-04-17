from rest_framework import serializers, authentication, permissions
from core.serializers import *
from core.models import CustomerRequestRelationship

from allauth.headless.contrib.rest_framework.authentication import (
    XSessionTokenAuthentication,
)

class CustomerRequestRelationshipSerializer(serializers.ModelSerializer):
    request = RequestSerializer(read_only=True)
    customer = CustomerSerializer(read_only=True)
    customer_type = CustomerTypeSerializer(read_only=True)


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
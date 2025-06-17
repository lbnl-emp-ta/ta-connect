from rest_framework import serializers, authentication, permissions
from core.serializers import *
from core.models import CustomerRequestRelationship

from allauth.headless.contrib.rest_framework.authentication import (
    XSessionTokenAuthentication,
)

class CustomerRequestRelationshipSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer()
    customer_type = CustomerTypeSerializer()
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
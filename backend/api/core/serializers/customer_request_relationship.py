from rest_framework import serializers

from core.models import CustomerRequestRelationship

class CustomerRequestRelationshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerRequestRelationship
        fields = "__all__"
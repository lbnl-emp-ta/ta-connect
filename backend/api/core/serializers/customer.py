from rest_framework import serializers

from core.models import *


class CustomerSerializer(serializers.ModelSerializer):
    active_requests_count = serializers.SerializerMethodField()
    total_requests_count = serializers.SerializerMethodField()

    def get_active_requests_count(self, obj):
        return obj.customerrequestrelationship_set.exclude(request__owner=None).count()

    def get_total_requests_count(self, obj):
        return obj.customerrequestrelationship_set.count()

    class Meta:
        model = Customer
        fields = "__all__"

class CustomerEditSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(max_length=256, required=False, allow_null=True)
    name = serializers.CharField(max_length=256, required=False, allow_null=True)
    phone = serializers.CharField(max_length=64, required=False, allow_null=True)
    title = serializers.CharField(max_length=256, required=False, allow_null=True)

    class Meta:
        model = Customer
        fields = "__all__"

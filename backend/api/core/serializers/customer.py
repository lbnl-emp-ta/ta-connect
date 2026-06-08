from rest_framework import serializers

from core.models import *
from core.serializers import * 

class CustomerSerializer(serializers.ModelSerializer):
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
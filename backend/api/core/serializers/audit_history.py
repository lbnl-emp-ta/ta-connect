from rest_framework import serializers

from core.models import *

class AuditHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditHistory
        fields = "__all__"
    
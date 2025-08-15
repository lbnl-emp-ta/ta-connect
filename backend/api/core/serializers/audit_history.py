from rest_framework import serializers

from core.models import *
from core.serializers import *

class AuditHistorySerializer(serializers.ModelSerializer):
    user = UserLeanSerializer()
    role = RoleSerializer()

    class Meta:
        model = AuditHistory
        fields = "__all__"
    
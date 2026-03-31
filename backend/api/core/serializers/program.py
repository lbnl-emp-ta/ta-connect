from rest_framework import serializers

from core.models import *

class ProgramSerializer(serializers.ModelSerializer):
    owner_id = serializers.SerializerMethodField()

    def get_owner_id(self, obj):
        try:
            return obj.owner.id
        except Exception:
            return None

    class Meta:
        model = Program
        fields = "__all__"
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers

from core.models import *
from core.serializers.depth import DepthSerializer


class ProgramSerializer(serializers.ModelSerializer):
    owner_id = serializers.SerializerMethodField()
    depths = DepthSerializer(many=True, read_only=True)

    def get_owner_id(self, obj):
        try:
            return obj.owner.id
        except ObjectDoesNotExist:
            return None

    class Meta:
        model = Program
        fields = "__all__"


class ProgramLeanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ["id", "name", "description"]

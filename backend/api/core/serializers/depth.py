from rest_framework import serializers

from core.models import Depth

class DepthSerializer(serializers.ModelSerializer):
    class Meta:
        model = Depth
        fields = "__all__"
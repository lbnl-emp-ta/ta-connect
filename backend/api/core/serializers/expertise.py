from rest_framework import serializers

from core.models import Expertise
from .topic import TopicSerializer
from .depth import DepthSerializer


class ExpertiseSerializer(serializers.ModelSerializer):
    topic = TopicSerializer()
    depth = DepthSerializer()

    class Meta:
        model = Expertise
        fields = ["topic", "depth"]

from rest_framework import serializers

from core.models import Depth, Expertise, Topic

from .depth import DepthSerializer
from .topic import TopicSerializer


class ExpertiseSerializer(serializers.ModelSerializer):
    topic = TopicSerializer()
    depth = DepthSerializer()

    class Meta:
        model = Expertise
        fields = ["id", "topic", "depth"]


class ExpertiseWriteSerializer(serializers.Serializer):
    topic = serializers.PrimaryKeyRelatedField(queryset=Topic.objects.all())
    depth = serializers.PrimaryKeyRelatedField(queryset=Depth.objects.all())

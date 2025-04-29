from rest_framework import serializers

from core.models import Cohort

class CohortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cohort
        fields = "__all__"
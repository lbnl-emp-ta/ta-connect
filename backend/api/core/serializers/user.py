from rest_framework import serializers

from core.models import User

class UserLeanSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["email", "name", "phone"]

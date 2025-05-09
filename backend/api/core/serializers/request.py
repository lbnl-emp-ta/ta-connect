from rest_framework import serializers
from django.utils import timezone

from core.models import Request, RequestStatus

class RequestSerializer(serializers.ModelSerializer):
    status = serializers.SlugRelatedField(
        slug_field="name", 
        required=False, 
        queryset=RequestStatus.objects.all()
    )
    
    @classmethod
    def date_in_past(cls, date):
        if date < timezone.now().date():
            return True
        
        return False
    
    def validate_proj_start_date(self, value):
        if RequestSerializer.date_in_past(value):
            raise serializers.ValidationError("Projected start date cannot be in the past")
        return value
            
    
    def validate_proj_completion_date(self, value):
        if RequestSerializer.date_in_past(value):
            raise serializers.ValidationError("Projected completion date cannot be in the past")
        return value
    
    def validate(self, data):
        if not (data.get("proj_start_date") and data.get("proj_completion_date")):
            return data
            
        if data["proj_completion_date"] < data["proj_start_date"]:
            raise serializers.ValidationError("Projected completion date must not be before projected start date")
        
        return data
    
    class Meta:
        model = Request
        fields = "__all__"
        read_only_fields = ["date_created"]
from django.utils import timezone
from rest_framework import serializers

from core.models import *

from .customer import CustomerSerializer
from .expert import ExpertSerializer
from .lab import LabSerializer
from .organization import OrganizationSerializer
from .owner import OwnerSerializer
from .program import ProgramLeanSerializer, ProgramSerializer
from .topic import TopicSerializer
from .user import UserLeanSerializer


class RequestDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    owner = OwnerSerializer()
    program = ProgramSerializer(read_only=True)
    lab = LabSerializer(read_only=True)
    expert = ExpertSerializer(read_only=True)
    organization = OrganizationSerializer(read_only=True)
    status = serializers.SlugRelatedField(
        slug_field="name", 
        required=False, 
        queryset=RequestStatus.objects.all()
    )
    depth = serializers.SlugRelatedField(
        slug_field="name",
        required=False,
        queryset=Depth.objects.all()
    )
    description = serializers.CharField(max_length=None)
    challenges = serializers.CharField(max_length=None)
    goals = serializers.CharField(max_length=None)
    effort = serializers.CharField(max_length=25, required=False, allow_null=True)
    date_created = serializers.DateTimeField()
    proj_start_date = serializers.DateField()
    proj_completion_date = serializers.DateField()
    actual_completion_date = serializers.DateField()
    customers = CustomerSerializer(many=True)
    topics = TopicSerializer(many=True)

class RequestListSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    date_created = serializers.DateTimeField()
    status = serializers.SlugRelatedField(
        slug_field="name", 
        required=False, 
        queryset=RequestStatus.objects.all()
    )
    depth = serializers.SlugRelatedField(
        slug_field="name",
        required=False,
        queryset=Depth.objects.all()
    )
    organization = OrganizationSerializer(read_only=True)
    expert = UserLeanSerializer(required=False)
    program = ProgramLeanSerializer(read_only=True)

class RequestExpertListSerializer(serializers.ModelSerializer):
    status = serializers.SlugRelatedField(
        slug_field="name", 
        required=False, 
        queryset=RequestStatus.objects.all()
    )

    depth = serializers.SlugRelatedField(
        slug_field="name",
        required=False,
        queryset=Depth.objects.all()
    )

    class Meta:
        model = Request 
        fields = ['id', 'date_created', 'status', 'depth']

class RequestSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    # owner field added later
    program = serializers.SlugRelatedField(slug_field="name", read_only=True)
    lab = serializers.SlugRelatedField(slug_field="name", read_only=True)
    expert = serializers.SlugRelatedField(
        slug_field="email",
        required=False,
        allow_null=True,
        queryset=User.objects.all()
    ) 
    status = serializers.SlugRelatedField(
        slug_field="name", 
        required=False,  
        allow_null=True,
        queryset=RequestStatus.objects.all()
    )
    depth = serializers.SlugRelatedField(
        slug_field="name",
        required=False,
        allow_null=True,
        queryset=Depth.objects.all()
    )
    description = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    challenges = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    goals = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    effort = serializers.CharField(max_length=25, required=False, allow_null=True, allow_blank=True)
    date_created = serializers.DateTimeField()
    proj_start_date = serializers.DateField(required=False, allow_null=True)
    proj_completion_date = serializers.DateField(required=False, allow_null=True)
    actual_completion_date = serializers.DateField(required=False, allow_null=True)
    topics = TopicSerializer(many=True)

    
    @classmethod
    def date_in_past(cls, date):
        return date < timezone.now().date()
            
    
    def validate_proj_completion_date(self, value):
        if value is None:
            return value

        if RequestSerializer.date_in_past(value):
            raise serializers.ValidationError("Projected completion date cannot be in the past")
        return value
    
    
    def validate(self, data):
        if not (data.get("proj_start_date") and data.get("proj_completion_date")):
            return data
            
        if (
            data["proj_start_date"] is not None
            and data["proj_completion_date"] < data["proj_start_date"]
        ):
            raise serializers.ValidationError("Projected completion date must not be before projected start date")
        
        return data
    
    
    def update(self, instance, validated_data):
        # Handle foreign key relationships that need special handling
        if 'depth' in validated_data:
            depth_name = validated_data.pop('depth')
            instance.depth = Depth.objects.get(name=depth_name)
        
        if 'expert' in validated_data:
            expert_email = validated_data.pop('expert')
            if expert_email:
                instance.expert = User.objects.get(email=expert_email)
            else:
                instance.expert = None
        
        if 'status' in validated_data:
            status_name = validated_data.pop('status')
            instance.status = RequestStatus.objects.get(name=status_name)
        
        # Update remaining fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance
    
    
    class Meta:
        model = Request
        fields = "__all__"
        read_only_fields = ["date_created"]

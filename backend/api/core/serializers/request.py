from rest_framework import serializers
from django.utils import timezone

from core.serializers import * 
from core.models import * 

class RequestDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    owner = OwnerSerializer()
    expert = serializers.SlugRelatedField(
        slug_field="email",
        required=False,
        queryset=User.objects.all()
    ) 
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
    date_created = serializers.DateTimeField()
    proj_start_date = serializers.DateTimeField()
    proj_completion_date = serializers.DateTimeField()
    actual_completion_date = serializers.DateTimeField()
    customers = CustomerSerializer(many=True)

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
    
    expert = UserLeanSerializer(required=False) 

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
    description = serializers.CharField(max_length=None, required=False, allow_null=True, allow_blank=True)
    date_created = serializers.DateTimeField()
    proj_start_date = serializers.DateField(required=False, allow_null=True)
    proj_completion_date = serializers.DateField(required=False, allow_null=True)
    actual_completion_date = serializers.DateField(required=False, allow_null=True)
    topics = TopicSerializer(many=True)

    
    @classmethod
    def date_in_past(cls, date):
        if date < timezone.now().date():
            return True
        
        return False
    
    def validate_proj_start_date(self, value):
        if value is None:
            return value

        if RequestSerializer.date_in_past(value):
            raise serializers.ValidationError("Projected start date cannot be in the past")
        return value
            
    
    def validate_proj_completion_date(self, value):
        if value is None:
            return value

        if RequestSerializer.date_in_past(value):
            raise serializers.ValidationError("Projected completion date cannot be in the past")
        return value
    
    def validate(self, data):
        if not (data.get("proj_start_date") and data.get("proj_completion_date")):
            return data
            
        if data["proj_start_date"] is not None:
            if data["proj_completion_date"] < data["proj_start_date"]:
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
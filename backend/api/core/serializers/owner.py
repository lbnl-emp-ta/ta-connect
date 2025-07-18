from rest_framework import serializers

from core.constants import DOMAINTYPE
from core.models import Owner
from core.serializers import * 

class OwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Owner
        fields = "__all__"
    
    # Expects a valid Owner objects
    def format_owner(self, owner):
        if not owner:
            return None
        data = dict()
        data["id"] = owner.pk
        data["domain_type"] = owner.domain_type
        
        domain_name = None
        domain_description = None
        domain_id = None
        match owner.domain_type:
            case DOMAINTYPE.RECEPTION:
                domain_id = owner.reception.pk
                domain_name = owner.reception.name
                domain_description = None
            case DOMAINTYPE.PROGRAM:
                domain_id = owner.program.pk
                domain_name = owner.program.name
                domain_description = owner.program.description
            case DOMAINTYPE.LAB:
                domain_id = owner.lab.pk
                domain_name = owner.lab.name
                domain_description = owner.lab.description
        
        data["domain_name"] = domain_name
        data["domain_description"] = domain_description 
        data["domain_id"] = domain_id 

        return data

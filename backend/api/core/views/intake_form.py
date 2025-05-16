from rest_framework.generics import CreateAPIView
from rest_framework import status
from rest_framework.response import Response

from core.models import *

class ProcessIntakeForm(CreateAPIView):
    def post(self, request):
        success = False

        name = request.data.get("name", None)
        email = request.data.get("email", None)
        phone = request.data.get("phone", None)
        title = request.data.get("title", None)
        tpr = request.data.get("tpr", None)
        state_abbr = request.data.get("state", None)
        organization = request.data.get("organization", None)
        organization_address = request.data.get("organizationAddress", None)
        organization_type = request.data.get("organizationType", None)
        ta_depth = request.data.get("taDepth", None)
        desc = request.data.get("description", None)
        
        
        _customer_request_relationship = None
        _request = None
        
        _customer = None
        _customer_created = False
        
        _org = None
        _org_created = False
        try:
            _request = Request.objects.create(
                description=desc, 
                depth=Depth.objects.filter(name=ta_depth).first()
            )
            
            _org_created = False
            _org = Organization.objects.filter(name=organization).first()
            if (not _org):
                _org = Organization.objects.create(
                    name=organization, 
                    address=organization_address, 
                    type=OrganizationType.objects.filter(name=organization_type).first()
                )
                _org_created = True
            
            _customer = Customer.objects.filter(email=email).first()
            
            _customer_created = False
            if(not _customer):
                _customer = Customer.objects.create(
                    org = _org,
                    state = State.objects.filter(abbreviation=state_abbr).first(),
                    tpr = TransmissionPlanningRegion.objects.filter(name=tpr).first(),
                    email=email,
                    name=name,
                    phone=phone,
                    title=title
                )
                _customer_created = True
            
            _customer_request_relationship = CustomerRequestRelationship.objects.create(
                request=_request,
                customer=_customer,
                customer_type = CustomerType.objects.get(name="Primary Contact")
            )
            
            success = True
            return Response({
                    "name": _customer.name,
                    "email": _customer.email,
                    "phone": _customer.phone,
                    "title": _customer.title,
                    "tpr": _customer.tpr.name,
                    "state": _customer.state.abbreviation,
                    "organization": _customer.org.name,
                    "organizationAddress": _customer.org.address,
                    "organizationType": _customer.org.type.name,
                    "tadepth": _request.depth.name,
                    "description": _request.description
                }, 
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        finally:

            # If the processing the intake form was successful,
            # no need to delete aritfacts.
            if (not success):
                if(_customer_request_relationship):
                    _customer_request_relationship.delete()
                
                if(_request):
                    _request.delete()
                
                if (_customer_created and _customer):
                    _customer.delete()
                    
                if (_org_created and _org):
                    _org.delete() 

            
            
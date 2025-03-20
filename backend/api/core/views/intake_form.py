from rest_framework.generics import CreateAPIView
from rest_framework import status
from rest_framework.response import Response

from core.models import *

class ProcessIntakeForm(CreateAPIView):
    def post(self, request):
        name = request.data.get("name", None)
        email = request.data.get("email", None)
        phone = request.data.get("phone", None)
        title = request.data.get("title", None)
        tpr = request.data.get("tpr", None)
        state_abbr = request.data.get("state", None)
        organization = request.data.get("organization", None)
        organization_address = request.data.get("organizationAddress", None)
        organization_type = request.data.get("organizationType", None)
        ta_depth = request.data.get("tadepth", None)
        desc = request.data.get("description", None)
        
        try:
            _request = Request.objects.create(
                description=desc, 
                depth=Depth.objects.filter(name=ta_depth).first()
            )
            
            _org = Organization.objects.filter(name=organization).first()
            if (not _org):
                _org = Organization.objects.create(
                    name=organization, 
                    address=organization_address, 
                    type=OrganizationType.objects.filter(name=organization_type).first()
                )
            
            _customer = Customer.objects.filter(email=email, name=name).first() 
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
            
            CustomerRequestRelationship.objects.create(
                request=_request,
                customer=_customer,
                customer_type = CustomerType.objects.get(name="Primary Contact")
            )
            
        except Exception as e:
            print(e.__str__())
            return Response({"message": e.__str__()}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(request.data, status=status.HTTP_201_CREATED)
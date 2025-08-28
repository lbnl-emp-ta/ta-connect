from django.db import transaction

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
        ta_depth = request.data.get("taDepth", None)
        desc = request.data.get("description", None)
        cohort = request.data.get("cohort", None)
        
        try:
            with transaction.atomic():
                _request = Request.objects.create(
                    description=desc, 
                    depth=Depth.objects.get(name=ta_depth)
                )

                
                _org = Organization.objects.filter(name=organization)
                if not _org.exists():
                    _org = Organization.objects.create(
                        name=organization, 
                        address=organization_address, 
                        type=OrganizationType.objects.get(name=organization_type)
                    )
                else:
                    _org = _org.first()
            
                _customer = Customer.objects.filter(email=email)
                if(not _customer.exists()):
                    _customer = Customer.objects.create(
                        org = _org,
                        state = State.objects.get(abbreviation=state_abbr),
                        tpr = TransmissionPlanningRegion.objects.get(name=tpr),
                        email=email,
                        name=name,
                        phone=phone,
                        title=title
                    )
                else: 
                    _customer = _customer.first()
                
                _cohort = None
                if cohort:
                    _cohort = Cohort.objects.create(request=_request, description="")
                    for participant in cohort:
                        CohortParticipant.objects.create(name=participant["name"], 
                                                        email=participant["email"], 
                                                        state=State.objects.get(abbreviation=participant["state"]), 
                                                        cohort=_cohort) 
            
                CustomerRequestRelationship.objects.create(
                    request=_request,
                    customer=_customer,
                    customer_type = CustomerType.objects.get(name="Primary Contact")
                )
                
                response_data = {
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
                    "description": _request.description,
                }
                
                if cohort:
                    response_data["cohort"] = {
                        "request": _cohort.request,
                        "name": _cohort.name,
                        "description": _cohort.description,
                        "participants": participant
                    }
            
                return Response(response_data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

            
            
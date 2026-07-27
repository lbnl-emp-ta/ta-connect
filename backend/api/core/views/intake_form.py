from django.db import transaction

from rest_framework.generics import CreateAPIView
from rest_framework import status
from rest_framework.response import Response

from core.utils import create_audit_history
from core.models.audit_history import ActionType
from core.models import *

class ProcessIntakeForm(CreateAPIView):
    def post(self, request):
        name = request.data.get("name", None)
        email = request.data.get("email", None)
        phone = request.data.get("phone", None)
        title = request.data.get("title", None)
        tpr = request.data.get("tpr", None)
        state_abbr = request.data.get("state", None)
        organization_id = request.data.get("organization_id", None)
        organization_name = request.data.get("organization_name", None)
        organization_address = request.data.get("organization_address", None)
        organization_type = request.data.get("organization_type", None)
        description = request.data.get("description", None)
        challenges = request.data.get("challenges", None)
        goals = request.data.get("goals", None)
        effort = request.data.get("effort", None)
        cohort = request.data.get("cohort", None)
        
        try:
            with transaction.atomic():
                _org = Organization.objects.filter(id=organization_id).first()
                if not _org:
                    _org = Organization.objects.create(
                        name=organization_name,
                        address=organization_address,
                        state=State.objects.get(abbreviation=state_abbr),
                        transmission_planning_region=TransmissionPlanningRegion.objects.get(name=tpr),
                        type=OrganizationType.objects.get(name=organization_type)
                    )

                _request = Request.objects.create(
                    organization=_org,
                    description=description,
                    challenges=challenges,
                    goals=goals,
                    effort=effort
                )

                _customer = Customer.objects.filter(email=email)
                if not _customer.exists():
                    _customer = Customer.objects.create(
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
                    is_poc=True
                )

                create_audit_history(request, _request, ActionType.StatusChange, f"Request created")
                create_audit_history(request, _request, ActionType.Assignment, f"Assigned to Reception")
                
                response_data = {
                    "name": _customer.name,
                    "email": _customer.email,
                    "phone": _customer.phone,
                    "title": _customer.title,
                    "tpr": _org.transmission_planning_region.name,
                    "state": _org.state.abbreviation,
                    "organization": _org.name,
                    "organizationAddress": _org.address,
                    "organizationType": _org.type.name,
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

            
            
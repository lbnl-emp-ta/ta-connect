import pytest
from rest_framework import status

from core.models import Customer, Request

@pytest.mark.django_db
class TestProcessIntakeFormEndpoint:
    def test_process_intake_form_with_existing_organization(self, api_client, test_customer, test_request):
        org = test_request.organization
        data = {
            "name": test_customer.name,
            "email": test_customer.email,
            "phone": test_customer.phone,
            "title": test_customer.title,
            "organization_id": org.id,
            "taDepth": test_request.depth.name,
            "description": test_request.description
        }
        response = api_client.post("/api/process-intake-form/", data=data)
        assert response.status_code == status.HTTP_201_CREATED

    def test_process_intake_form_with_new_organization(self, api_client, test_customer, test_request):
        org = test_request.organization
        data = {
            "name": test_customer.name,
            "email": test_customer.email,
            "phone": test_customer.phone,
            "title": test_customer.title,
            "tpr": org.transmission_planning_region.name,
            "state": org.state.abbreviation,
            "organization_name": "New Test Organization",
            "organization_address": "123 New Test St, Springfield, IL 62701",
            "organization_type": org.type.name,
            "taDepth": test_request.depth.name,
            "description": "A brand new request from a brand new organization"
        }
        response = api_client.post("/api/process-intake-form/", data=data)
        assert response.status_code == status.HTTP_201_CREATED
    
        
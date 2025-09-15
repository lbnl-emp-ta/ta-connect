import pytest
from rest_framework import status

from core.models import Customer, Request

@pytest.mark.django_db(transaction=True)
class TestProcessIntakeFormEndpoint:
    def test_process_intake_form_endpoint_exists_at_given_location(self, api_client, test_customer, test_request):
        data = {
            "name": test_customer.name,
            "email": test_customer.email,
            "phone": test_customer.phone,
            "title": test_customer.title,
            "tpr": test_customer.tpr.name,
            "state": test_customer.state.abbreviation,
            "organization": test_customer.org.name,
            "organizationAddress": test_customer.org.address,
            "organizationType": test_customer.org.type,
            "taDepth": test_request.depth.name,
            "description": test_request.description
        }
        response = api_client.post("/api/process-intake-form/", data=data)
        assert response.status_code == status.HTTP_201_CREATED
    
        
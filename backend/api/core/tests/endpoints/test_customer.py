import pytest

from core.models import *

@pytest.mark.django_db
class TestCustomerCreateEndpoint():     
    def test_create_request_endpoint_exists_at_desired_location(self, api_client, test_state, test_org, test_tpr):        
        data = {
            "org": test_org.pk,
            "state": test_state.pk,
            "tpr": test_tpr.pk,
            "email": "test@email.com",
            "name": "test names",
            "phone": "999-999-9999",
            "title": "Tester"
        }
        
        response = api_client.post("/customers/", data=data)
        assert response.status_code == 201
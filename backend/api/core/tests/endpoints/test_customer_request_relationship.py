import pytest

from rest_framework import status
from core.models import *

@pytest.mark.django_db
class TestCustomerRequestRelationshipEndpoint():
    def test_customer_request_relationship_endpoint_exists_at_desired_location(self, api_client):
        # need to be authenticated to access endpoint
        api_client.force_login(User.objects.get(pk=1)) 
        response = api_client.get("/api/customer-request-relationships/", headers={"Context": '{"user":1,"role":1,"location":"System"}'})
        assert response.status_code == status.HTTP_200_OK
import pytest

from rest_framework import status
from core.tests.conftest import TEST_USER_PASSWORD

@pytest.mark.django_db
class TestCustomerRequestRelationshipCreateEndpoint():
    def test_create_customer_request_relationship_endpoint_exists_at_desired_location(self, 
                                                                                      api_client, 
                                                                                      test_customer_type, 
                                                                                      test_customer, 
                                                                                      test_request, 
                                                                                      test_user):

        # need to be authenticated to access endpoint
        api_client.force_login(test_user) 
        data = {
            "request": test_request.pk,
            "customer": test_customer.pk,
            "customer_type": test_customer_type.pk
        }
        
        response = api_client.post("/api/customer-request-relationships/", data=data)
        assert response.status_code == status.HTTP_201_CREATED
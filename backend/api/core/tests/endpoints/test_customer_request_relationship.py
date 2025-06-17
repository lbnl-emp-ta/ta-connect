import pytest

from rest_framework import status

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
        response = api_client.get("/api/customer-request-relationships/")
        assert response.status_code == status.HTTP_200_OK
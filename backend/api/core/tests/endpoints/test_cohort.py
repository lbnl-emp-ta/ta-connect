import pytest

@pytest.mark.django_db
class TestCohortCreateViewEndpoint():
    def test_create_request_endpoint_exists_at_desired_location(self, api_client, test_request):
        data = {
            "request": test_request.pk,
            "name": "TestCohort",
            "description": "for testing"
        }
        
        response = api_client.post("/cohorts/", data=data)
        print(response.content)
        assert response.status_code == 201
        
    
@pytest.mark.django_db    
class TestCohortAddCustomerEndpoint():
    def test_create_request_endpoint_exists_at_desired_location(self, api_client, test_customer, test_cohort):
        data = {
            "customer": test_customer.pk,
            "cohort": test_cohort.pk
        }
        
        response = api_client.post("/cohorts/add-customer/", data=data)
        assert response.status_code == 201
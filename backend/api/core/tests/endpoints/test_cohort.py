import pytest

from rest_framework.reverse import reverse
from rest_framework import status

from core.models import Cohort, Customer

@pytest.mark.django_db
class TestCohortCreateViewEndpoint():
    def test_create_cohort_endpoint_exists_at_desired_location(self, api_client, test_request):
        data = {
            "request": test_request.pk,
            "name": "TestCohort",
            "description": "for testing"
        }
        
        response = api_client.post("/cohorts/", data)
        assert response.status_code == status.HTTP_201_CREATED
        
    
@pytest.mark.django_db    
class TestCohortAddCustomerEndpoint():
    @classmethod
    def post_endpoint(self):
        return reverse("cohort-customer-add")
    
    def test_add_customer_to_cohort_endpoint_exists_at_desired_location(self, api_client, test_customer, test_cohort):
        data = {
            "customer": test_customer.pk,
            "cohort": test_cohort.pk
        }
        
        response = api_client.post("/cohorts/add-customer/", data)
        assert response.status_code == status.HTTP_201_CREATED
        
    def test_add_customer_to_cohort_endpoint_returns_bad_request_when_missing_cohort_field(self, api_client, test_customer):
        data = {
            "customer": test_customer.pk,
        }
        
        response = api_client.post(self.post_endpoint(), data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        
    def test_add_customer_to_cohort_endpoint_returns_bad_request_when_missing_customer_field(self, api_client, test_cohort):
        data = {
            "cohort": test_cohort.pk
        }
        
        response = api_client.post(self.post_endpoint(), data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_add_customer_to_cohort_endpoint_returns_bad_request_when_cohort_does_not_exist(self, api_client, test_customer):
        non_existent_cohort_pk = -1
        assert not Cohort.objects.filter(pk=non_existent_cohort_pk).exists()
        
        data = {
            "customer": test_customer.pk,
            "cohort": non_existent_cohort_pk
        }
        
        response = api_client.post(self.post_endpoint(), data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        
    def test_add_customer_to_cohort_endpoint_returns_bad_request_when_customer_does_not_exist(self, api_client, test_cohort):
        non_existent_customer_pk = -1
        assert not Customer.objects.filter(pk=non_existent_customer_pk).exists()
        
        data = {
            "customer": non_existent_customer_pk,
            "cohort": test_cohort.pk
        }
        
        response = api_client.post(self.post_endpoint(), data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
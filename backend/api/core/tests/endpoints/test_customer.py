import pytest

from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from core.models import State, Organization, OrganizationType, TransmissionPlanningRegion

@pytest.mark.django_db
class TestCustomerCreateEndpoint():
    
    @classmethod
    def setup_class(cls):
        cls.client = APIClient()
        
    @classmethod
    def make_post_request_with(cls, data):
        return cls.client.post(reverse("customers-create"), data=data)
    
    def test_create_request_endpoint_exists_at_desired_location(self):
        test_state = State.objects.create(
            name="TestState",
            abbreviation="TS"
        )
        
        test_org_type = OrganizationType.objects.create(
            name="TestOrgType",
            description="For testing purposes"
        )
        
        test_org = Organization.objects.create(
            name="TestOrg",
            address="123 Test Street",
            type=test_org_type,
        )
        
        test_tpr = TransmissionPlanningRegion.objects.create(
            name="TestTPR"
        )
        
        data = {
            "state": test_state.pk,
            "org": test_org.pk,
            "tpr": test_tpr.pk,
            "email": "test@email.com",
            "name": "test name",
            "phone": "999-999-9999",
            "title": "Tester"
        }
        
        response = self.client.post("/customers/", data=data)
        assert response.status_code == 201
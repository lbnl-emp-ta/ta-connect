import pytest

from rest_framework.test import APIClient
from rest_framework.reverse import reverse

from core.models import OrganizationType

@pytest.mark.django_db
class TestOrganizationListEndpoint():
    @classmethod  
    def setup_class(cls):
        cls.client = APIClient()
    
    def test_list_organization_endpoint_exists_at_desired_location(self):
        response = self.client.get("/organizations/")
        assert response.status_code == 200

@pytest.mark.django_db
class TestOrganizationCreateEndpoint():
    @classmethod  
    def setup_class(cls):
        cls.client = APIClient()
        
    @classmethod
    def make_post_request_with(cls, data):
        return cls.client.post(reverse("organization-create"), data=data)
    
    def test_create_request_endpoint_exists_at_desired_location(self):
        test_org = OrganizationType.objects.create(
            name="TestOrgType",
            description="For testing purposes."
        )
        
        data = {
            "name": "TestOrg",
            "address": "123 Test Street, TestVille, South Testerland",
            "type": test_org.pk,
        }
        
        response = self.client.post("/organizations/", data=data)
        assert response.status_code == 201
    
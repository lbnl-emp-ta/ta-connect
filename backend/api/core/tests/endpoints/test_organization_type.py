import pytest

from rest_framework.test import APIClient

from core.models import OrganizationType

@pytest.mark.django_db
class TestOrganizationTypeListEndpoint():
    @classmethod  
    def setup_class(cls):
        cls.client = APIClient()
    
    def test_list_organization_types_endpoint_exists_at_desired_location(self):
        response = self.client.get("/organization-types/", follow=True)
        assert response.status_code == 200


@pytest.mark.django_db
class TestOrganizationTypeRetrieveEndpoint():
    @classmethod  
    def setup_class(cls):
        cls.client = APIClient()
    
    def test_retrieve_organization_type_endpoint_exists_at_desired_location(self):
        test_depth = OrganizationType.objects.create(name="Test", description="for testing")
        
        response = self.client.get(f"/organization-types/{test_depth.pk}", follow=True)
        assert response.status_code == 200
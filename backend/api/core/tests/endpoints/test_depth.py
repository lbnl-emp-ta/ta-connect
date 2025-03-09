import pytest

from rest_framework.test import APIClient

from core.models import Depth

@pytest.mark.django_db
class TestDepthListEndpoint():
    @classmethod  
    def setup_class(cls):
        cls.client = APIClient()
    
    def test_list_depths_endpoint_exists_at_desired_location(self):
        response = self.client.get("/depths", follow=True)
        assert response.status_code == 200


@pytest.mark.django_db
class TestDepthRetrieveEndpoint():
    @classmethod  
    def setup_class(cls):
        cls.client = APIClient()
    
    def test_retrieve_depth_endpoint_exists_at_desired_location(self):
        test_depth = Depth.objects.create(name="Test", description="for testing")
        
        response = self.client.get(f"/depths/{test_depth.pk}", follow=True)
        assert response.status_code == 200
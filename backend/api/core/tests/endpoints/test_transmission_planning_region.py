import pytest

from rest_framework.test import APIClient


@pytest.mark.django_db
class TestTransmissionPlanningRegionListEndpoint():
    @classmethod  
    def setup_class(cls):
        cls.client = APIClient()
    
    def test_list_depths_endpoint_exists_at_desired_location(self):
        response = self.client.get("/transmission-planning-regions/", follow=True)
        assert response.status_code == 200
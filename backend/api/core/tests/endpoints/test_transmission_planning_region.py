import pytest

from rest_framework import status

@pytest.mark.django_db
class TestTransmissionPlanningRegionListEndpoint():
    def test_list_depths_endpoint_exists_at_desired_location(self, api_client):
        response = api_client.get("/api/transmission-planning-regions/", follow=True)
        assert response.status_code == status.HTTP_200_OK
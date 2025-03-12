import pytest


@pytest.mark.django_db
class TestTransmissionPlanningRegionListEndpoint():
    def test_list_depths_endpoint_exists_at_desired_location(self, api_client):
        response = api_client.get("/transmission-planning-regions/", follow=True)
        assert response.status_code == 200
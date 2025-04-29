import pytest

from rest_framework import status

@pytest.mark.django_db
class TestDepthListEndpoint():
    def test_list_depths_endpoint_exists_at_desired_location(self, api_client):
        response = api_client.get("/depths/")
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestDepthRetrieveEndpoint():  
    def test_retrieve_depth_endpoint_exists_at_desired_location(self, api_client, test_depth):
        response = api_client.get(f"/depths/{test_depth.pk}")
        assert response.status_code == status.HTTP_200_OK
import pytest

from rest_framework.test import APIClient

from core.models import Depth

@pytest.mark.django_db
class TestDepthListEndpoint():
    def test_list_depths_endpoint_exists_at_desired_location(self, api_client):
        response = api_client.get("/depths/")
        assert response.status_code == 200


@pytest.mark.django_db
class TestDepthRetrieveEndpoint():  
    def test_retrieve_depth_endpoint_exists_at_desired_location(self, api_client, test_depth):
        response = api_client.get(f"/depths/{test_depth.pk}")
        assert response.status_code == 200
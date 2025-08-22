import pytest

from rest_framework import status

@pytest.mark.django_db
class TestOrganizationListEndpoint():
    def test_list_organization_endpoint_exists_at_desired_location(self, api_client):
        response = api_client.get("/api/organizations/")
        assert response.status_code == status.HTTP_200_OK
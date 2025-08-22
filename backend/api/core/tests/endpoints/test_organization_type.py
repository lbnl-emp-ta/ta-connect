import pytest

from rest_framework import status

@pytest.mark.django_db
class TestOrganizationTypeListEndpoint():
    def test_list_organization_types_endpoint_exists_at_desired_location(self, api_client):
        response = api_client.get("/api/organization-types/", follow=True)
        assert response.status_code == status.HTTP_200_OK

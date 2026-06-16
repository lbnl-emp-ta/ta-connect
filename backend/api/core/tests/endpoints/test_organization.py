import pytest

from rest_framework import status

from core.models import User

@pytest.mark.django_db
class TestOrganizationListEndpoint():
    def test_list_organization_endpoint_exists_at_desired_location(self, api_client):
        api_client.force_login(User.objects.get(pk=1))
        response = api_client.get("/api/organizations/", headers={"X-Admin-Mode": "true"})
        assert response.status_code == status.HTTP_200_OK
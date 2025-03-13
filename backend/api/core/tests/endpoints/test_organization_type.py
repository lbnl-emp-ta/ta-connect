import pytest

from rest_framework import status

@pytest.mark.django_db
class TestOrganizationTypeListEndpoint():
    def test_list_organization_types_endpoint_exists_at_desired_location(self, api_client):
        response = api_client.get("/organization-types/", follow=True)
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestOrganizationTypeRetrieveEndpoint():
    def test_retrieve_organization_type_endpoint_exists_at_desired_location(self, api_client, test_org_type):
        response = api_client.get(f"/organization-types/{test_org_type.pk}", follow=True)
        assert response.status_code == status.HTTP_200_OK
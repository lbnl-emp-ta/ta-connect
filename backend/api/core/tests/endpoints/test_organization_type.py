import pytest

from rest_framework.test import APIClient

from core.models import OrganizationType

@pytest.mark.django_db
class TestOrganizationTypeListEndpoint():
    def test_list_organization_types_endpoint_exists_at_desired_location(self, api_client):
        response = api_client.get("/organization-types/", follow=True)
        assert response.status_code == 200


@pytest.mark.django_db
class TestOrganizationTypeRetrieveEndpoint():
    def test_retrieve_organization_type_endpoint_exists_at_desired_location(self, api_client, test_org_type):
        response = api_client.get(f"/organization-types/{test_org_type.pk}", follow=True)
        assert response.status_code == 200
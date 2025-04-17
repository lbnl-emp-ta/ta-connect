import pytest

from rest_framework import status

@pytest.mark.django_db
class TestOrganizationListEndpoint():
    def test_list_organization_endpoint_exists_at_desired_location(self, api_client):
        response = api_client.get("/api/organizations/")
        assert response.status_code == status.HTTP_200_OK

@pytest.mark.django_db
class TestOrganizationCreateEndpoint():
    def test_create_organization_endpoint_exists_at_desired_location(self, api_client, test_org_type):
        data = {
            "name": "TestOrg",
            "address": "123 Test Street, TestVille, South Testerland",
            "type": test_org_type.pk,
        }
        
        response = api_client.post("/api/organizations/", data=data)
        assert response.status_code == status.HTTP_201_CREATED
    
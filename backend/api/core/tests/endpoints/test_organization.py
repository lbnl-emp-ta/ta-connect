import pytest

from rest_framework.test import APIClient
from rest_framework.reverse import reverse

from core.models import OrganizationType

@pytest.mark.django_db
class TestOrganizationListEndpoint():
    def test_list_organization_endpoint_exists_at_desired_location(self, api_client):
        response = api_client.get("/organizations/")
        assert response.status_code == 200

@pytest.mark.django_db
class TestOrganizationCreateEndpoint():
    def test_create_request_endpoint_exists_at_desired_location(self, api_client, test_organization_type):
        data = {
            "name": "TestOrg",
            "address": "123 Test Street, TestVille, South Testerland",
            "type": test_organization_type.pk,
        }
        
        response = api_client.post("/organizations/", data=data)
        assert response.status_code == 201
    
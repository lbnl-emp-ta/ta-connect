import pytest
from rest_framework import status

from core.models import *


@pytest.mark.django_db
class TestRequestDetailViewEndpoint:

    def test_request_detail_get_view_should_fail_when_missing_admin_header(self, api_client):
        # User with pk=1 should be an Admin
        api_client.force_login(User.objects.get(pk=1)) 
        response = api_client.get("/api/requests/1")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_request_detail_get_view_should_succeed_with_admin_header(self, api_client):
        actual_request = Request.objects.get(pk=1)
        # User with pk=1 should be an Admin
        api_client.force_login(User.objects.get(pk=1))
        response = api_client.get("/api/requests/1", headers={"X-Admin-Mode": "true"})

        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == actual_request.id

    def test_request_detail_get_view_should_fail_when_not_authorized(self, api_client):
        response = api_client.get("/api/requests/1")

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_request_detail_get_view_should_succeed(self, api_client):
        actual_request = Request.objects.get(pk=1)
        # User with pk=3 should be a Reception Coordinator
        api_client.force_login(User.objects.get(pk=3))
        response = api_client.get("/api/requests/1")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == actual_request.id

    def test_request_detail_patch_view_should_fail_when_missing_admin_header(self, api_client):
        # User with pk=1 should be an Admin
        api_client.force_login(User.objects.get(pk=1)) 
        response = api_client.patch("/api/requests/1")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_request_detail_patch_view_should_fail_when_not_authorized(self, api_client):
        response = api_client.patch("/api/requests/1")

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_request_detail_patch_view_should_succeed_when_patching_description(self, api_client):
        old_request = Request.objects.get(pk=1)
        data = {"description": "New Test Description"}
        # User with pk=3 should be a Reception Coordinator
        api_client.force_login(User.objects.get(pk=3))
        response = api_client.patch("/api/requests/1", data=data)
        
        assert response.status_code == status.HTTP_200_OK
        
        new_request = Request.objects.get(pk=1)
        
        assert old_request == new_request
        

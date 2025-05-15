from datetime import datetime, timezone
import dateutil
import pytest

from rest_framework.reverse import reverse
from rest_framework import status
from django.utils import timezone


@pytest.mark.django_db
class TestRequestCreateEndpoint():
    @classmethod
    def post_endpoint(cls):
        return reverse("request-list-create")
    
    def test_create_request_endpoint_exists_at_desired_location(self, api_client, test_user):
        data = {
            "description": "test",
        }
        
        # Need to be authenticated for this endpoint
        api_client.force_login(test_user)
        response = api_client.post("/api/requests/", data=data)
        assert response.status_code == status.HTTP_201_CREATED
    
    def test_create_request_is_successful_given_only_desc_and_depth(self, api_client, test_user):
        """
        The only required field for creating a Request is its
        description.
        """
        
        data = {
            "description": "test",
        }

        api_client.force_login(test_user) 
        response = api_client.post(self.post_endpoint(), data=data)
        assert response.status_code == status.HTTP_201_CREATED
        
    def test_create_request_fails_given_no_desc(self, api_client, test_user):
        """
        Description is a required field.
        """
        
        data = {}

        api_client.force_login(test_user) 
        response = api_client.post(self.post_endpoint(), data=data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        
    def test_create_request_is_succesful_and_ignores_given_date_created(self, api_client, test_user):
        """
        Any given date created field should be ignored. Date 
        created should be the current date as of creating the 
        Request.
        """
        
        given_date_created = datetime.strptime("2000-01-01", "%Y-%m-%d")
        
        data = {
            "description": "test",
            "date_created": given_date_created
        }

        api_client.force_login(test_user) 
        response = api_client.post(self.post_endpoint(), data=data)
        
        received_date_created = dateutil.parser.parse(response.data.get("date_created"))
        
        assert received_date_created != given_date_created
        assert received_date_created.date() == timezone.now().date()
        
        
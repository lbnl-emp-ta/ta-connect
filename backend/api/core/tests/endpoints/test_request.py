from datetime import datetime, timezone
import dateutil
import pytest

from rest_framework.test import APIClient
from rest_framework.reverse import reverse
from django.utils import timezone


@pytest.mark.django_db
class TestRequestCreateEndpoint():
    @classmethod  
    def setup_class(cls):
        cls.client = APIClient()
        
    @classmethod
    def make_post_request_with(cls, data):
        return cls.client.post(reverse("request-create"), data=data)
    
    def test_create_request_endpoint_exists_at_desired_location(self):
        data = {
            "description": "test"
        }
        
        response = self.client.post("/requests/", data=data)
        assert response.status_code == 201
    
    def test_create_request_is_successful_given_only_desc(self):
        """
        The only required field for creating a Request is its
        description.
        """
        
        data = {
            "description": "test"
        }
        
        response = self.make_post_request_with(data)
        assert response.status_code == 201
        
    def test_create_request_fails_given_no_desc(self):
        """
        Description is a required field.
        """
        
        data = {}
        response = self.make_post_request_with(data)
        
        assert response.status_code == 400
        
    def test_create_request_is_succesful_and_ignores_given_date_created(self):
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
        response = self.make_post_request_with(data)
        
        received_date_created = dateutil.parser.parse(response.data.get("date_created"))
        
        assert received_date_created != given_date_created
        assert received_date_created.date() == timezone.now().date()
        
        
import datetime
import dateutil

from rest_framework.test import APITestCase
from rest_framework.test import APIRequestFactory

from core.views import RequestCreateView

class RequestEndpointTests(APITestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
    
    def test_create_request_with_only_desc(self):
        """
        The only required field for creating a Request is its
        description.
        """
        
        data = {
            "description": "test"
        }
        request = self.factory.post("request-create", data=data)
        response = RequestCreateView.as_view()(request)
        
        self.assertEqual(response.status_code, 201)
        
    def test_create_request_with_no_desc(self):
        """
        Description is a required field.
        """
        
        data = {}
        request = self.factory.post("request-create", data=data)
        response = RequestCreateView.as_view()(request)
        
        self.assertEqual(response.status_code, 400)
        
    def test_create_request_with_date_created(self):
        """
        Any given date created field should be ignored. Date 
        created should be the current date as of creating the 
        Request.
        """
        
        given_date_created = datetime.datetime.strptime("2000-01-01", "%Y-%m-%d")
        
        data = {
            "description": "test",
            "date_created": given_date_created
        }
        request = self.factory.post("request-create", data=data)
        response = RequestCreateView.as_view()(request)
        
        received_date_created = dateutil.parser.parse(response.data.get("date_created"))
        
        given_date_ignored = received_date_created != given_date_created
        received_date_is_today = received_date_created.date() == datetime.date.today()
        
        
        self.assertTrue(given_date_ignored and received_date_is_today)
        
        
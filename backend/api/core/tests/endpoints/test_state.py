import pytest

from rest_framework.test import APIClient

from core.models import State

@pytest.mark.django_db
class TestStateListEndpoint():
    @classmethod  
    def setup_class(cls):
        cls.client = APIClient()
    
    def test_list_states_endpoint_exists_at_desired_location(self):
        response = self.client.get("/states/", follow=True)
        assert response.status_code == 200


@pytest.mark.django_db
class TestStateRetrieveEndpoint():
    @classmethod  
    def setup_class(cls):
        cls.client = APIClient()
    
    def test_retrieve_state_endpoint_exists_at_desired_location(self):
        test_depth = State.objects.create(name="For Test", abbreviation="FT")
        
        response = self.client.get(f"/states/{test_depth.pk}", follow=True)
        assert response.status_code == 200
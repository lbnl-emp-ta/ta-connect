import pytest

from rest_framework import status

@pytest.mark.django_db
class TestStateListEndpoint():
    def test_list_states_endpoint_exists_at_desired_location(self, api_client):
        response = api_client.get("/states/", follow=True)
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestStateRetrieveEndpoint():
    def test_retrieve_state_endpoint_exists_at_desired_location(self, api_client, test_state):
        response = api_client.get(f"/states/{test_state.pk}", follow=True)
        assert response.status_code == status.HTTP_200_OK
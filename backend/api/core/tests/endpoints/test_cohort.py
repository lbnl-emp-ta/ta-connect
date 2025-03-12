import pytest

@pytest.mark.django_db
class TestCohortCreateViewEndpoint():
    def test_create_request_endpoint_exists_at_desired_location(self, api_client, test_request):
        data = {
            "request": test_request.pk,
            "name": "TestCohort",
            "description": "for testing"
        }
        
        response = api_client.post("/cohorts/", data=data)
        print(response.content)
        assert response.status_code == 201
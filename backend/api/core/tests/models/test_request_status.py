from core.models import RequestStatus
import pytest

# Create your tests here.
@pytest.mark.django_db
class TestRequestStatusModel():
    def test_get_default_pk_gets_existing_status_when_default_does_exist(self):
        """
        If the default status for a new Request exists,
        it is returned.
        """

        existing_default_status_pk = RequestStatus.objects.get(name=RequestStatus.default_name).pk
        
        found_default_status_pk = RequestStatus.get_default_pk()
        
        assert existing_default_status_pk == found_default_status_pk
        
        
        
       
from core.models import RequestStatus
import pytest

# Create your tests here.
@pytest.mark.django_db
class TestRequestStatusModel():
    def test_get_default_pk_when_does_not_exist(self):
        """
        If the default status for a new Request does not 
        exist, one is created.
        """
        
        default_status_exists_before_call = RequestStatus.objects.filter(name=RequestStatus.default_name).exists()
        assert not default_status_exists_before_call
            
        RequestStatus.get_default_pk()
        
        default_status_exists_after_call = RequestStatus.objects.filter(name=RequestStatus.default_name).exists()
        assert default_status_exists_after_call
    
    def test_get_default_pk_when_does_exist(self):
        """
        If the default status for a new Request exists,
        it is returned.
        """
        
        RequestStatus.objects.create(
            name=RequestStatus.default_name,
            description=RequestStatus.default_description
        )
        
        existing_default_status_pk = RequestStatus.objects.get(name=RequestStatus.default_name).pk
        
        found_default_status_pk = RequestStatus.get_default_pk()
        
        assert existing_default_status_pk == found_default_status_pk
        
        
        
       
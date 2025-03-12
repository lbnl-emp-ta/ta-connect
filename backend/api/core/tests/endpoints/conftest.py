import pytest
from rest_framework.test import APIClient

from core.models import State, OrganizationType, Organization, Depth, TransmissionPlanningRegion

@pytest.fixture(scope="session")
def api_client():
    return APIClient()

@pytest.fixture(scope="function")
def test_state(django_db_blocker):
    with django_db_blocker.unblock():
        _test_state, _ = State.objects.get_or_create(
            name="SessionTestState", 
            abbreviation="STS"
        )
        
        return _test_state

@pytest.fixture(scope="function")
def test_org_type(django_db_blocker):
    with django_db_blocker.unblock():
        _test_org_type, _ = OrganizationType.objects.get_or_create(
            name="SessionTestOrgType", 
            description="for testing"
        )
        return _test_org_type
        
@pytest.fixture(scope="function")   
def test_org(django_db_blocker, test_org_type):
    with django_db_blocker.unblock(): 
        _test_org, _ = Organization.objects.get_or_create(
            name="SessionTestOrg",
            address="123 Test Street",
            type=test_org_type,
        )
        return _test_org
    
@pytest.fixture(scope="function")   
def test_depth(django_db_blocker):
    with django_db_blocker.unblock():
        _test_depth, _ = Depth.objects.get_or_create(
            name="SessionTestDepth", 
            description="for testing"
        )
        return _test_depth
        
        
@pytest.fixture(scope="function")   
def test_tpr(django_db_blocker):
    with django_db_blocker.unblock():
        _test_tpr, _ = TransmissionPlanningRegion.objects.get_or_create(
            name="TestTPR", 
        )
        return _test_tpr
import pytest
from rest_framework.test import APIClient

from core.models import *

@pytest.fixture(scope="session")
def api_client():
    return APIClient()

@pytest.fixture(scope="function")
def test_state(django_db_blocker):
    with django_db_blocker.unblock():
        _test_state, _ = State.objects.get_or_create(
            name="FixtureTestState", 
            abbreviation="FTS"
        )
        
        return _test_state

@pytest.fixture(scope="function")
def test_org_type(django_db_blocker):
    with django_db_blocker.unblock():
        _test_org_type, _ = OrganizationType.objects.get_or_create(
            name="FixtureTestOrgType", 
            description="for testing"
        )
        return _test_org_type
        
@pytest.fixture(scope="function")   
def test_org(django_db_blocker, test_org_type):
    with django_db_blocker.unblock(): 
        _test_org, _ = Organization.objects.get_or_create(
            name="FixtureTestOrg",
            address="123 Test Street",
            type=test_org_type,
        )
        return _test_org
    
@pytest.fixture(scope="function")   
def test_depth(django_db_blocker):
    with django_db_blocker.unblock():
        _test_depth, _ = Depth.objects.get_or_create(
            name="FixtureTestDepth", 
            description="for testing"
        )
        return _test_depth
        
        
@pytest.fixture(scope="function")   
def test_tpr(django_db_blocker):
    with django_db_blocker.unblock():
        _test_tpr, _ = TransmissionPlanningRegion.objects.get_or_create(
            name="FixtureTestTPR", 
        )
        return _test_tpr
    
@pytest.fixture(scope="function")
def test_customer(django_db_blocker, test_org, test_state, test_tpr):
    with django_db_blocker.unblock():
        _test_customer, _ = Customer.objects.get_or_create(
            org=test_org,
            state=test_state,
            tpr=test_tpr,
            email="fixturetestcustomer@email.com",
            name="FixtureTestCustomer",
            phone="999-999-9999",
            title="Tester"
        )
        
        return _test_customer
    
@pytest.fixture(scope="function")
def test_request_status(django_db_blocker):
    with django_db_blocker.unblock():
        _test_request_status, _ = RequestStatus.objects.get_or_create(
            name="FixtureTestRequestStatus",
            description="for testing"
        )
        
        return _test_request_status

@pytest.fixture(scope="function")
def test_request(django_db_blocker, test_request_status):
    with django_db_blocker.unblock():
        _test_request, _ = Request.objects.get_or_create(
            status=test_request_status,
            description="for testing"
        )
        
        return _test_request
    
    
@pytest.fixture(scope="function")
def test_customer_type(django_db_blocker):
    with django_db_blocker.unblock():
        _test_customer_type, _ = CustomerType.objects.get_or_create(
            name="FixtureTestCustomerType",
            description="for testing"
        )
        
        return _test_customer_type
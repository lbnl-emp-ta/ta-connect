
import pytest
from rest_framework.test import APIClient

from django.core.management import call_command

from core.models import *
from core.fixtures.populate_db import fixture_list 
from core.constants import ROLE


@pytest.fixture(scope="session")
def django_db_setup(django_db_setup, django_db_blocker):
    with django_db_blocker.unblock():
        for fixture in fixture_list:
            call_command("loaddata", fixture)


@pytest.fixture(scope="session")
def api_client():
    return APIClient()

@pytest.fixture(scope="function")
def test_user(django_db_setup):
        return User.objects.get(pk=1)
    

# @pytest.fixture(scope="function")
# def test_state(django_db_blocker):
#     with django_db_blocker.unblock():
#         _test_state, _ = State.objects.get_or_create(
#             name="FixtureTestState", 
#             abbreviation="FTS"
#         )
        
#         return _test_state

# @pytest.fixture(scope="function")
# def test_org_type(django_db_blocker):
#     with django_db_blocker.unblock():
#         _test_org_type, _ = OrganizationType.objects.get_or_create(
#             name="FixtureTestOrgType", 
#             description="for testing"
#         )
#         return _test_org_type
        
# @pytest.fixture(scope="function")   
# def test_org(django_db_blocker, test_org_type):
#     with django_db_blocker.unblock(): 
#         _test_org, _ = Organization.objects.get_or_create(
#             name="FixtureTestOrg",
#             address="123 Test Street",
#             type=test_org_type,
#         )
#         return _test_org
    
@pytest.fixture(scope="function")   
def test_depth(django_db_blocker):
    with django_db_blocker.unblock():
        return Depth.objects.get(pk=1) 
        
        
# @pytest.fixture(scope="function")   
# def test_tpr(django_db_blocker):
#     with django_db_blocker.unblock():
#         _test_tpr, _ = TransmissionPlanningRegion.objects.get_or_create(
#             name="FixtureTestTPR", 
#         )
#         return _test_tpr
    
@pytest.fixture(scope="function")
def test_customer(django_db_setup):
    return Customer.objects.get(pk=1) 
    
# @pytest.fixture(scope="function")
# def test_request_status(django_db_blocker):
#     with django_db_blocker.unblock():
#         _test_request_status, _ = RequestStatus.objects.get_or_create(
#             name="FixtureTestRequestStatus",
#             description="for testing"
#         )
        
#         return _test_request_status

@pytest.fixture(scope="function")
def test_request(django_db_setup):
    return Request.objects.get(pk=1) 
    
    
@pytest.fixture(scope="function")
def test_customer_type(django_db_setup):
    return CustomerType.objects.get(pk=1) 
    
# @pytest.fixture(scope="function")
# def test_cohort(django_db_blocker, test_request):
#     with django_db_blocker.unblock():
#         _test_cohort, _ = Cohort.objects.get_or_create(
#             request=test_request,
#             name="FixtureTestCohort",
#             description="for testing"
#         )
        
#         return _test_cohort
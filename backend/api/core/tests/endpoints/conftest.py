import pytest
from rest_framework.test import APIClient

from core.models import State, OrganizationType, Depth

@pytest.fixture(scope="session")
def api_client():
    return APIClient()

@pytest.fixture(scope="session")
def test_state(django_db_blocker):
    with django_db_blocker.unblock():
        return State.objects.create(name="TestState", abbreviation="TS")

@pytest.fixture(scope="session")
def test_organization_type(django_db_blocker):
    with django_db_blocker.unblock():
        return OrganizationType.objects.create(name="TestOrgType", description="for testing")
    
@pytest.fixture(scope="session")   
def test_depth(django_db_blocker):
    with django_db_blocker.unblock():
        return Depth.objects.create(name="TestDepth", description="for testing")
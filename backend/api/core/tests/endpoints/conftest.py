import pytest
from rest_framework.test import APIClient

from core.models import State, OrganizationType

@pytest.fixture(scope="session")
def api_client():
    return APIClient()

@pytest.fixture(scope="session")
def test_state(django_db_blocker):
    with django_db_blocker.unblock():
        return State.objects.create(name="For Test", abbreviation="FT")

@pytest.fixture(scope="session")
def test_organization_type(django_db_blocker):
    with django_db_blocker.unblock():
        return OrganizationType.objects.create(name="TestOrgType", description="for testing")
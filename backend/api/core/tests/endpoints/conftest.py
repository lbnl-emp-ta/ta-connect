import pytest
from pytest_django.plugin import django_db_blocker

from rest_framework.test import APIClient

from core.models import State

@pytest.fixture(scope="module")
def api_client():
    return APIClient()

@pytest.fixture(scope="module")
def test_state(django_db_blocker):
    with django_db_blocker.unblock():
        return State.objects.create(name="For Test", abbreviation="FT")
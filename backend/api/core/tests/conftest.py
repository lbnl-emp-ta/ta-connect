# Define test wide dependencies to reduce repetition

import pytest
from rest_framework.test import APIClient

from django.core.management import call_command

from core.models import *
from core.fixtures.populate_db import fixture_list 


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
    
@pytest.fixture(scope="function")   
def test_depth(django_db_blocker):
    with django_db_blocker.unblock():
        return Depth.objects.get(pk=1) 
        
@pytest.fixture(scope="function")
def test_customer(django_db_setup):
    return Customer.objects.get(pk=1) 
    

@pytest.fixture(scope="function")
def test_request(django_db_setup):
    return Request.objects.get(pk=1) 
    
    
@pytest.fixture(scope="function")
def test_customer_type(django_db_setup):
    return CustomerType.objects.get(pk=1) 
    
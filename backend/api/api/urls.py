"""
URL configuration for api project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from core.views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Even when using headless, the third-party provider endpoints are still
    # needed for handling e.g. the OAuth handshake. The account views
    # can be disabled using `HEADLESS_ONLY = True`.
    path("accounts/", include("allauth.urls")),

    # Include the API endpoints:
    path("_allauth/", include("allauth.headless.urls")),
    
    
    
    path('process-intake-form/', ProcessIntakeForm.as_view(), name="process-intake-form"),
    
    path('requests/', RequestCreateView.as_view(), name="request-create"),
    
    path('depths/', DepthListView.as_view(), name="depth-list"),
    path('depths/<int:pk>', DepthRetrieveView.as_view(), name="depth-retrieve"),
    
    path('states/', StateListView.as_view(), name="state-list"),
    path('states/<int:pk>', StateRetrieveView.as_view(), name="state-retrieve"),
    
    path('organization-types/', OrganizationTypeListView.as_view(), name="organization-type-list"),
    path('organization-types/<int:pk>', OrganizationTypeRetrieveView.as_view(), name="organization-type-retrieve"),
    
    path('organizations/', OrganizationListCreateView.as_view(), name="organization-list-create"),
    
    path('transmission-planning-regions/', TransmissionPlanningRegionListView.as_view(), name="transmission-planning-regions-list"),
    
    path('customers/', CustomerCreateView.as_view(), name="customer-create"),
    path('customer-request-relationships/', CustomerRequestRelationshipCreateView.as_view(), name="customer-request-relationship-create"),
    
    path('cohorts/', CohortCreateView.as_view(), name="cohort-create"),
    path('cohorts/add-customer/', CohortAddCustomerView.as_view(), name="cohort-customer-add"),
]

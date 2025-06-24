from django.urls import path
from core.views import *

urlpatterns = [
    path('process-intake-form/', ProcessIntakeForm.as_view(), name="process-intake-form"),
    
    path('requests/', RequestListView.as_view(), name="request-list"),
    path('requests/<int:id>', RequestDetailView.as_view(), name="request-detail"),

    path('identities/', IdentityListView.as_view(), name="identities-list"),
    
    path('depths/', DepthListView.as_view(), name="depth-list"),
    path('depths/<int:pk>', DepthRetrieveView.as_view(), name="depth-retrieve"),
    
    path('states/', StateListView.as_view(), name="state-list"),
    path('states/<int:pk>', StateRetrieveView.as_view(), name="state-retrieve"),
    
    path('organization-types/', OrganizationTypeListView.as_view(), name="organization-type-list"),
    path('organization-types/<int:pk>', OrganizationTypeRetrieveView.as_view(), name="organization-type-retrieve"),
    
    path('organizations/', OrganizationListCreateView.as_view(), name="organization-list-create"),
    
    path('transmission-planning-regions/', TransmissionPlanningRegionListView.as_view(), name="transmission-planning-regions-list"),
    
    path('customers/', CustomerCreateView.as_view(), name="customer-create"),
    path('customer-request-relationships/', CustomerRequestRelationshipListCreateView.as_view(), name="customer-request-relationship-create"),
    
    path('cohorts/', CohortCreateView.as_view(), name="cohort-create"),
    path('cohorts/add-customer/', CohortAddCustomerView.as_view(), name="cohort-customer-add"),
]

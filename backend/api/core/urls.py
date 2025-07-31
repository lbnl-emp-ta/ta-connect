from django.urls import path
from core.views import *

urlpatterns = [
    path('process-intake-form/', ProcessIntakeForm.as_view(), name="process-intake-form"),
    
    path('requests/', RequestListView.as_view(), name="request-list"),
    path('requests/<int:id>', RequestDetailView.as_view(), name="request-detail"),
    path('requests/<int:id>/mark-complete/', RequestMarkCompleteView.as_view(), name="mark-complete"),
    path('requests/<int:id>/closeout-complete/', RequestCloseoutCompleteView.as_view(), name="closeout-complete"),
    path('requests/<int:id>/cancel/', RequestCancelView.as_view(), name="mark-complete"),
    path('requests/assign/', AssignmentView.as_view(), name="assignment"),
    path('requests/<int:request_id>/upload-attachment/', UploadAttachmentView.as_view(), name="upload-attachment"),
    path('requests/<int:request_id>/download-attachment/<str:filename>/', DownloadAttachmentView.as_view(), name="download-attachment"),
    path('requests/<int:request_id>/delete-attachment/<str:filename>/', DeleteAttachmentView.as_view(), name="delete-attachment"),

    path('identities/', IdentityListView.as_view(), name="identities-list"),
    path('statuses/', StatusListView.as_view(), name="statuses-list"),
    path('owners/', OwnerListView.as_view(), name="owners-list"),
    path('experts/', ExpertsListView.as_view(), name="experts-list"),

    
    path('depths/', DepthListView.as_view(), name="depth-list"),
    path('depths/<int:pk>', DepthRetrieveView.as_view(), name="depth-retrieve"),
    
    path('states/', StateListView.as_view(), name="state-list"),
    path('states/<int:pk>', StateRetrieveView.as_view(), name="state-retrieve"),
    
    path('organizations/', OrganizationListCreateView.as_view(), name="organization-list-create"),
    path('organization-types/', OrganizationTypeListView.as_view(), name="organization-type-list"),
    path('organization-types/<int:pk>', OrganizationTypeRetrieveView.as_view(), name="organization-type-retrieve"),

    path('transmission-planning-regions/', TransmissionPlanningRegionListView.as_view(), name="transmission-planning-regions-list"),
    
    path('customers/', CustomerCreateView.as_view(), name="customer-create"),
    path('customer-request-relationships/', CustomerRequestRelationshipListCreateView.as_view(), name="customer-request-relationship-create"),
    
    path('cohorts/', CohortCreateView.as_view(), name="cohort-create"),
    path('cohorts/add-customer/', CohortAddCustomerView.as_view(), name="cohort-customer-add"),

]

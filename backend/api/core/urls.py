from django.urls import path
from core.views import *

urlpatterns = [
    path('process-intake-form/', ProcessIntakeForm.as_view(), name="process-intake-form"),
    
    path('requests/', RequestListView.as_view(), name="request-list"),
    path('requests/<int:id>', RequestDetailView.as_view(), name="request-detail"),

    path('requests/assign/', AssignmentView.as_view(), name="assignment"),
    path('requests/<int:id>/mark-complete/', RequestMarkCompleteView.as_view(), name="mark-complete"),
    path('requests/<int:id>/closeout-complete/', RequestCloseoutCompleteView.as_view(), name="closeout-complete"),
    path('requests/<int:id>/cancel/', RequestCancelView.as_view(), name="mark-complete"),
    
    path('requests/<int:request_id>/upload-attachment/', UploadAttachmentView.as_view(), name="upload-attachment"),
    path('requests/<int:request_id>/edit-attachment/<int:attachment_id>/', EditAttachmentView.as_view(), name="edit-attachment"),
    path('requests/<int:request_id>/download-attachment/<int:attachment_id>/', DownloadAttachmentView.as_view(), name="download-attachment"),
    path('requests/<int:request_id>/delete-attachment/<int:attachment_id>/', DeleteAttachmentView.as_view(), name="delete-attachment"),

    path('requests/<int:request_id>/list-notes/', NoteListView.as_view(), name="list-notes"),
    path('requests/<int:request_id>/add-note/', NoteCreateView.as_view(), name="add-note"),
    path('requests/<int:request_id>/delete-note/<int:note_id>/', NoteDeleteView.as_view(), name="delete-note"),

    path('identities/', IdentityListView.as_view(), name="identities-list"),
    path('statuses/', StatusListView.as_view(), name="statuses-list"),
    path('owners/', OwnerListView.as_view(), name="owners-list"),
    path('experts/', ExpertsListView.as_view(), name="experts-list"),
    path('depths/', DepthListView.as_view(), name="depth-list"),
    path('states/', StateListView.as_view(), name="state-list"),
<<<<<<< HEAD
    path('organizations/', OrganizationListView.as_view(), name="organization-list"),
=======
    path('states/<int:pk>', StateRetrieveView.as_view(), name="state-retrieve"),
    
    path('organizations/', OrganizationListView.as_view(), name="organization-list-create"),
>>>>>>> main
    path('organization-types/', OrganizationTypeListView.as_view(), name="organization-type-list"),
    path('transmission-planning-regions/', TransmissionPlanningRegionListView.as_view(), name="transmission-planning-regions-list"),
<<<<<<< HEAD
    path('customer-request-relationships/', CustomerRequestRelationshipListView.as_view(), name="customer-request-relationships-list"),
=======
    
    path('customers/<int:customer_id>', CustomerEditView.as_view(), name="customer-edit"),
    path('customer-request-relationships/', CustomerRequestRelationshipListView.as_view(), name="customer-request-relationship-create"),
    
    path('cohorts/', CohortCreateView.as_view(), name="cohort-create"),
    path('cohorts/add-customer/', CohortAddCustomerView.as_view(), name="cohort-customer-add"),

>>>>>>> main
    path('topics/', TopicListView.as_view(), name="topic-list"),
    
]

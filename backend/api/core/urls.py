from django.urls import path
from core.views import *

urlpatterns = [
    path('process-intake-form/', ProcessIntakeForm.as_view(), name="process-intake-form"),
    
    path('requests/', RequestListView.as_view(), name="request-list"),
    path('requests/<int:request_id>', RequestDetailView.as_view(), name="request-detail"),

    path('requests/<int:request_id>/assign/', AssignmentView.as_view(), name="assignment"),
    path('requests/<int:request_id>/transfer-customer/', CustomerTransferView.as_view(), name="transfer-customer"),
    path('requests/<int:request_id>/transfer-organization/', OrganizationTransferView.as_view(), name="transfer-organization"),
    path('requests/<int:request_id>/owners/', OwnerListView.as_view(), name="owners-list"),
    path('requests/<int:request_id>/audit-history/', AuditHistoryListView.as_view(), name="list-audit-history"),
    path('requests/<int:request_id>/cancel/', RequestCancelView.as_view(), name="cancel"),
    path('requests/<int:request_id>/reopen/', RequestReopenView.as_view(), name="reopen"),

    path('requests/<int:request_id>/upload-attachment/', UploadAttachmentView.as_view(), name="upload-attachment"),
    path('requests/<int:request_id>/edit-attachment/<int:attachment_id>/', EditAttachmentView.as_view(), name="edit-attachment"),
    path('requests/<int:request_id>/download-attachment/<int:attachment_id>/', DownloadAttachmentView.as_view(), name="download-attachment"),
    path('requests/<int:request_id>/delete-attachment/<int:attachment_id>/', DeleteAttachmentView.as_view(), name="delete-attachment"),

    path('requests/<int:request_id>/closeout-form/', CloseoutFormView.as_view(), name="closeout-form"),
    path('requests/<int:request_id>/submit-closeout-form/', RequestSubmitCloseoutFormView.as_view(), name="submit-closeout-form"),
    path('requests/<int:request_id>/approve-closeout-form-by-lab/', RequestApproveCloseoutFormByLabView.as_view(), name="approve-closeout-form-by-lab"),
    path('requests/<int:request_id>/approve-closeout-form-by-program/', RequestApproveCloseoutFormByProgramView.as_view(), name="approve-closeout-form-by-program"),

    path('requests/<int:request_id>/list-notes/', NoteListView.as_view(), name="list-notes"),
    path('requests/<int:request_id>/add-note/', NoteCreateView.as_view(), name="add-note"),
    path('requests/<int:request_id>/delete-note/<int:note_id>/', NoteDeleteView.as_view(), name="delete-note"),

    path('users/<int:user_id>', UserEditView.as_view(), name="user-edit"),
    path('identities/', IdentityListView.as_view(), name="identities-list"),
    path('statuses/', StatusListView.as_view(), name="statuses-list"),
    path('experts/', ExpertsListView.as_view(), name="experts-list"),
    path('depths/', DepthListView.as_view(), name="depth-list"),
    path('states/', StateListView.as_view(), name="state-list"),

    path('organizations/', OrganizationListView.as_view(), name="organization-list"),
    path('organizations/create/', OrganizationCreateView.as_view(), name="organization-create"),
    path('organizations/<int:organization_id>', OrganizationDetailView.as_view(), name="organization-detail"),
    path('organization-types/', OrganizationTypeListView.as_view(), name="organization-type-list"),
    path('transmission-planning-regions/', TransmissionPlanningRegionListView.as_view(), name="transmission-planning-regions-list"),

    path('customer-request-relationships/', CustomerRequestRelationshipListView.as_view(), name="customer-request-relationships-list"),
    path('customers/', CustomerListView.as_view(), name="customer-list"),
    path('customers/create/', CustomerCreateView.as_view(), name="customer-create"),
    path('customers/<int:customer_id>', CustomerDetailView.as_view(), name="customer-edit"),
    path('customer-request-relationships/', CustomerRequestRelationshipListView.as_view(), name="customer-request-relationship-create"),

    path('topics/', TopicListView.as_view(), name="topic-list"),

    path('lab-role-assignments/<int:lab_role_assignment_id>/expertises/', ExpertiseUpdateView.as_view(), name="update-expertises"),
]

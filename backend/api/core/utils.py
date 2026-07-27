from core.models.audit_history import AuditHistory
from core.models.request_status import RequestStatus
from core.constants import REQUEST_STATUS


def create_audit_history(request, request_obj, action_type, description):
    """
    Create an audit history entry for a given action on a request.
    """
    AuditHistory.objects.create(
        request=request_obj,
        user=request.user,
        action_type=action_type,
        description=description
    )


def get_status(rs: REQUEST_STATUS) -> RequestStatus:
    """Helper function to get RequestStatus object from REQUEST_STATUS enum value."""
    return RequestStatus.objects.get(name=rs.value)


from core.constants import REQUEST_STATUS
from core.models.audit_history import AuditHistory
from core.models.request_status import RequestStatus


def create_audit_history(request, request_obj, action_type, description):
    """
    Create an audit history entry for a given action on a request.
    """
    AuditHistory.objects.create(
        request=request_obj,
        user=request.user if request.user.is_authenticated else None,
        action_type=action_type,
        description=description,
    )


def get_status(rs: REQUEST_STATUS) -> RequestStatus:
    """Helper function to get RequestStatus object from REQUEST_STATUS enum value."""
    return RequestStatus.objects.get(name=rs.value)

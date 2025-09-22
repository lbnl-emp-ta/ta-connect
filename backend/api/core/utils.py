import json

from core.models.audit_history import AuditHistory
from core.models.role import Role


def create_audit_history(request, request_obj, action_type, description):
    """
    Create an audit history entry for a given action on a request.
    """
    try:
        # Get role from request context
        maybe_context = request.headers.get("Context")
        if maybe_context:
            context = json.loads(maybe_context)
            role_id = context.get("role")
            if role_id:
                role = Role.objects.get(pk=role_id)
                
                # Create the audit history entry
                AuditHistory.objects.create(
                    request=request_obj,
                    user=request.user,
                    role=role,
                    action_type=action_type,
                    description=description
                )
    except (json.JSONDecodeError, Role.DoesNotExist) as e:
        print(f"Error creating audit history: {e}")
        pass
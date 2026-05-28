from rest_framework import permissions
from core.constants import REQUEST_STATUS
from core.models import Role, ReceptionRoleAssignment, SystemRoleAssignment, ProgramRoleAssignment, LabRoleAssignment, Owner


def is_admin(request) -> bool:
    """
    Returns True if the authenticated user has an Admin system assignment
    AND the request includes the X-Admin-Mode: true header.
    """
    if request.headers.get("X-Admin-Mode", "").lower() != "true":
        return False
    role = Role.objects.filter(name="Admin").first()
    if not role:
        return False
    return SystemRoleAssignment.objects.filter(user=request.user, role=role).exists()


def is_coordinator(user) -> bool:
    """
    Returns True if the user holds any Coordinator reception-level assignment.
    Coordinator is effectively system-wide.
    """
    role = Role.objects.filter(name="Coordinator").first()
    if not role:
        return False
    return ReceptionRoleAssignment.objects.filter(user=user, role=role).exists()


def is_program_lead_for_request(user, ta_request) -> bool:
    """Returns True if the user is a Program Lead for the request's program."""
    if not ta_request.program_id:
        return False
    role = Role.objects.filter(name="Program Lead").first()
    if not role:
        return False
    return ProgramRoleAssignment.objects.filter(
        user=user, role=role, instance_id=ta_request.program_id
    ).exists()


def is_lab_lead_for_request(user, ta_request) -> bool:
    """Returns True if the user is a Lab Lead for the request's lab."""
    if not ta_request.lab_id:
        return False
    role = Role.objects.filter(name="Lab Lead").first()
    if not role:
        return False
    return LabRoleAssignment.objects.filter(
        user=user, role=role, instance_id=ta_request.lab_id
    ).exists()


def is_expert_for_request(user, ta_request) -> bool:
    """Returns True if the user is the assigned expert for the request."""
    return bool(ta_request.expert_id) and ta_request.expert_id == user.pk


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view=None):
        return is_admin(request)


class IsCoordinator(permissions.BasePermission):
    """
    View-level: True if the user has a Coordinator role in reception.
    Object-level: True if the user is a coordinator AND the request is currently owned by reception.
    Unless the request is in a closed state, in which case any coordinator has object-level permission (for reopening).
    """
    def has_permission(self, request, view=None):
        return is_coordinator(request.user)
    
    def has_object_permission(self, request, view, obj):
        if obj.status.name in [REQUEST_STATUS.COMPLETED, REQUEST_STATUS.UNABLE_TO_ADDRESS]:
            return is_coordinator(request.user)
        return is_coordinator(request.user) and obj.owner_id == Owner.get_default_pk()


class IsProgramLead(permissions.BasePermission):
    """
    View-level: True if the user has any Program Lead assignment.
    Object-level: True if the user is the Program Lead for that specific request.
    """
    def has_permission(self, request, view=None):
        role = Role.objects.filter(name="Program Lead").first()
        if not role:
            return False
        return ProgramRoleAssignment.objects.filter(user=request.user, role=role).exists()

    def has_object_permission(self, request, view, obj):
        return is_program_lead_for_request(request.user, obj)


class IsLabLead(permissions.BasePermission):
    """
    View-level: True if the user has any Lab Lead assignment.
    Object-level: True if the user is the Lab Lead for that specific request.
    """
    def has_permission(self, request, view=None):
        role = Role.objects.filter(name="Lab Lead").first()
        if not role:
            return False
        return LabRoleAssignment.objects.filter(user=request.user, role=role).exists()

    def has_object_permission(self, request, view, obj):
        return is_lab_lead_for_request(request.user, obj)


class IsExpert(permissions.BasePermission):
    """
    View-level: True if the user has any Expert lab assignment.
    Object-level: True if the user is the assigned expert on that specific request.
    """
    def has_permission(self, request, view=None):
        role = Role.objects.filter(name="Expert").first()
        if not role:
            return False
        return LabRoleAssignment.objects.filter(user=request.user, role=role).exists()

    def has_object_permission(self, request, view, obj):
        return is_expert_for_request(request.user, obj)


class IsAnyRoleOnRequest(permissions.BasePermission):
    def has_permission(self, request, view=None):
        return (
            is_admin(request) or
            is_coordinator(request.user) or
            IsLabLead().has_permission(request, view) or
            IsProgramLead().has_permission(request, view) or
            IsExpert().has_permission(request, view)
        )

    def has_object_permission(self, request, view, obj):
        return (
            is_admin(request) or
            is_coordinator(request.user) or
            is_program_lead_for_request(request.user, obj) or
            is_lab_lead_for_request(request.user, obj) or
            is_expert_for_request(request.user, obj)
        )


def compose(*classes):
    """
    Combines permission classes with OR logic, producing a BasePermission
    subclass whose has_permission and has_object_permission accept an optional
    view argument. Can be called as:
        ComposedClass().has_permission(request)
        ComposedClass().has_object_permission(request, view, obj)
    """
    class Composed(permissions.BasePermission):
        def has_permission(self, request, view=None):
            return any(cls().has_permission(request, view) for cls in classes)

        def has_object_permission(self, request, view, obj):
            """
            Check if the user can act on the current request object.
            Make sure the user has permission for the role AND object for at least one of the classes.
            """
            return any(
                cls().has_permission(request, view) and cls().has_object_permission(request, view, obj)
                for cls in classes
            )

    return Composed


# Composed permission aliases for common checks.

# Assignment
CanAssignForwardToReception = compose(IsAdmin)
CanAssignBackToReception = compose(IsAdmin, IsProgramLead)
CanAssignForwardToProgram = compose(IsAdmin, IsCoordinator)
CanAssignBackToProgram = compose(IsAdmin, IsLabLead)
CanAssignForwardToLab = compose(IsAdmin, IsProgramLead)
CanAssignBackToLab = compose(IsAdmin, IsExpert)
CanAssignForwardToExpert = compose(IsAdmin, IsProgramLead, IsLabLead)
# Field Edits
CanEditDescription = compose(IsAdmin, IsCoordinator, IsProgramLead)
CanEditChallenges = compose(IsAdmin, IsCoordinator, IsProgramLead)
CanEditGoals = compose(IsAdmin, IsCoordinator, IsProgramLead)
CanEditEffort = compose(IsAdmin, IsCoordinator, IsProgramLead)
CanEditDepth = compose(IsAdmin, IsCoordinator, IsProgramLead, IsLabLead)
CanEditTopics = compose(IsAdmin, IsCoordinator, IsProgramLead, IsLabLead)
CanEditProjectedStartDate = compose(IsAdmin, IsCoordinator, IsProgramLead, IsLabLead, IsExpert)
CanEditProjectedCompletionDate = compose(IsAdmin, IsCoordinator, IsProgramLead, IsLabLead, IsExpert)
CanEditActualCompletionDate = compose(IsAdmin, IsCoordinator, IsProgramLead, IsLabLead, IsExpert)
CanEditCustomerBasic = compose(IsAdmin, IsCoordinator, IsProgramLead, IsLabLead)
CanEditCustomerOrgType = compose(IsAdmin)
# Notes and Attachments
CanAddNote = compose(IsAdmin, IsCoordinator, IsProgramLead, IsLabLead, IsExpert)
CanDeleteNote = compose(IsAdmin, IsCoordinator, IsProgramLead, IsLabLead, IsExpert)
CanAddAttachment = compose(IsAdmin, IsCoordinator, IsProgramLead, IsLabLead, IsExpert)
CanEditAttachment = compose(IsAdmin, IsCoordinator, IsProgramLead, IsLabLead, IsExpert)
CanDeleteAttachment = compose(IsAdmin, IsCoordinator, IsProgramLead, IsLabLead, IsExpert)
# Closeout
CanStartCloseout = compose(IsAdmin, IsProgramLead, IsLabLead, IsExpert)
CanEditCloseoutResponses = compose(IsAdmin, IsProgramLead, IsLabLead, IsExpert)
CanSubmitCloseout = compose(IsAdmin, IsProgramLead, IsLabLead, IsExpert)
CanApproveCloseoutByLab = compose(IsAdmin, IsLabLead)
CanRejectCloseoutByLab = compose(IsAdmin, IsLabLead)
CanApproveCloseoutByProgram = compose(IsAdmin, IsProgramLead)
CanRejectCloseoutByProgram = compose(IsAdmin, IsProgramLead)
# Other
CanCancel = compose(IsAdmin, IsCoordinator, IsProgramLead)
CanReopen = compose(IsAdmin, IsCoordinator, IsProgramLead)

    
        
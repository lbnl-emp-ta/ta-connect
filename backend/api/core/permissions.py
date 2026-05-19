from rest_framework import permissions
from core.models import Role, ReceptionRoleAssignment, SystemRoleAssignment, ProgramRoleAssignment, LabRoleAssignment


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
    def has_permission(self, request, view=None):
        return is_coordinator(request.user)


class IsProgramLead(permissions.BasePermission):
    """
    View-level: True if the user has any Program Lead assignment (broad check).
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
    View-level: True if the user has any Lab Lead assignment (broad check).
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
    View-level: True if the user has any Expert lab assignment (broad check).
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
            return any(cls().has_object_permission(request, view, obj) for cls in classes)

    return Composed


# Composed permission aliases for common checks.
CanAssignReception = compose(IsAdmin, IsProgramLead)
CanAssignProgram = compose(IsAdmin, IsCoordinator, IsLabLead)
CanAssignLab = compose(IsAdmin, IsProgramLead, IsExpert)
CanAssignExpert = compose(IsAdmin, IsLabLead, IsProgramLead)
CanMarkComplete = compose(IsAdmin, IsProgramLead)
CanCancel = compose(IsAdmin, IsCoordinator)
CanSubmitCloseout = compose(IsAdmin, IsExpert)
CanApproveCloseoutByLab = compose(IsAdmin, IsLabLead)
CanApproveCloseoutByProgram = compose(IsAdmin, IsProgramLead)
CanEditDescription = compose(IsAdmin, IsProgramLead, IsCoordinator)
CanEditDepth = compose(IsAdmin, IsProgramLead, IsLabLead, IsCoordinator)
CanEditTopics = compose(IsAdmin, IsProgramLead, IsLabLead, IsCoordinator)
    
        
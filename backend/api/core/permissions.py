from rest_framework import permissions
from core.models import User, Role, ReceptionRoleAssignment, SystemRoleAssignment, ProgramRoleAssignment, LabRoleAssignment

def validate_context(context):
    if (not context):
        return False
    
    if (not (context.user and context.role and context.location and context.instance)):
        return False

    return True


def get_location_role_assignment_class(location):
    match location.lower():
        case "reception":
            return ReceptionRoleAssignment 

        case "system":
            return SystemRoleAssignment

        case "program":
            return ProgramRoleAssignment

        case "lab":
            return LabRoleAssignment
        
        case _:
            return False 


def has_role(context, role_name):
        if(not validate_context(context)):
            return False

        user = User.objects.filter(email=context.user.email)
        if (not user):
            return False

        role = Role.objects.filter(name=role_name)
        if (not role):
            return False

        location_role_assignment_class = get_location_role_assignment_class(context.location)
        if (not location_role_assignment_class):
            return False

        assignments = location_role_assignment_class.objects.filter(user=user, role=role_name, instance=context.instance)

        if (location_role_assignment_class == LabRoleAssignment):
            assignments = assignments.filter(program=context.program)

        if(not assignments):
            return False
        
        return True 

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return has_role(request.context, "Admin")

class IsProgramLead(permissions.BasePermission):
    def has_permission(self, request, view):
        return has_role(request.context, "Program Lead")

class IsLabLead(permissions.BasePermission):
    def has_permission(self, request, view):
        return has_role(request.context, "Lab Lead")
    
class IsExpert(permissions.BasePermission):
    def has_permission(self, request, view):
        return has_role(request.context, "Expert")
    
        
from rest_framework import permissions
from core.models import User, Role, ReceptionRoleAssignment, SystemRoleAssignment, ProgramRoleAssignment, LabRoleAssignment
import json

def validate_context(context):
    if (not context):
        return False
    
    if (not (context.get("user") and context.get("role") and context.get("location") and context.get("instance"))):
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


def has_role(request, role_name):
        context = json.loads(request.headers.get("Context"))

        if(not validate_context(context)):
            return False

        user = User.objects.get(pk=request.user.id)
        if (not user):
            return False

        role = Role.objects.filter(name=role_name).first()
        if (not role):
            return False
            
        location_role_assignment_class = get_location_role_assignment_class(context.get("location"))
        if (not location_role_assignment_class):
            return False

        assignments = location_role_assignment_class.objects.filter(user=user, role=role, id=context.get("instance"))

        if (location_role_assignment_class == LabRoleAssignment):
            assignments = assignments.filter(program=context.get("program"))

        if(not assignments):
            return False
        
        return True 

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return has_role(request, "Admin")

class IsCoordinator(permissions.BasePermission):
    def has_permission(self, request, view):
        return has_role(request, "Coordinator")

class IsProgramLead(permissions.BasePermission):
    def has_permission(self, request, view):
        return has_role(request, "Program Lead")

class IsLabLead(permissions.BasePermission):
    def has_permission(self, request, view):
        return has_role(request, "Lab Lead")
    
class IsExpert(permissions.BasePermission):
    def has_permission(self, request, view):
        return has_role(request, "Expert")
    
        
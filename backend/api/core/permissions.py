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


def has_role(context, role_name, location_name=""):
        if(not validate_context(context)):
            return False

        user = User.objects.filter(id=context.get("user")).first()
        if (not user):
            print("NOT USER")
            return False

        role = Role.objects.filter(name=role_name).first()
        if (not role):
            print("NOT ROLE")
            return False
            
        location_role_assignment_class = get_location_role_assignment_class(context.get("location"))
        if (not location_role_assignment_class):
            print("NOT LOCATION")
            return False

        assignments = location_role_assignment_class.objects.filter(user=user, role=role, id=context.get("instance"))

        if (location_role_assignment_class == LabRoleAssignment):
            assignments = assignments.filter(program=context.get("program"))

        if(not assignments):
            print("NOT ASSIGNMETNS")
            return False
        
        return True 

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return has_role(json.loads(request.headers.get("Context")), role_name="Admin", location_name="System")

class IsProgramLead(permissions.BasePermission):
    def has_permission(self, request, view):
        return has_role(json.loads(request.headers.get("Context")), "Program Lead")

class IsLabLead(permissions.BasePermission):
    def has_permission(self, request, view):
        return has_role(json.loads(request.headers.get("Context")), "Lab Lead")
    
class IsExpert(permissions.BasePermission):
    def has_permission(self, request, view):
        return has_role(json.loads(request.headers.get("Context")), "Expert")
    
        
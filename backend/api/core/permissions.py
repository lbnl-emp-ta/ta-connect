from rest_framework import permissions
from core.models import User, SystemRoleAssignment, ProgramRoleAssignment, LabRoleAssignment

def has_role(user, assignment_class, role_name):
        user = User.objects.filter(email=user.email)
        assignment = assignment_class.objects.filter(user=user).first()

        if(not assignment):
            return False

        role = assignment.role

        if(role.name.lower() != role_name.lower()):
            return False
        
        return True 

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if(not request.user):
            return False

        return has_role(request.user, SystemRoleAssignment, "Admin")

class IsProgramLead(permissions.BasePermission):
    def has_permission(self, request, view):
        if(not request.user):
            return False

        return has_role(request.user, ProgramRoleAssignment, "Program Lead")

class IsLabLead(permissions.BasePermission):
    def has_permission(self, request, view):
        if(not request.user):
            return False

        return has_role(request.user, LabRoleAssignment, "Lab Lead")
    
class IsExpert(permissions.BasePermission):
    def has_permission(self, request, view):
        if(not request.user):
            return False

        return has_role(request.user, LabRoleAssignment, "Expert")
    
        
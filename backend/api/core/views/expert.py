import json

from django.db.models import Q
from rest_framework import views, status, authentication, permissions
from rest_framework.response import Response

from core.models import *
from core.serializers import *
from core.permissions import *
from core.constants import ROLE

from allauth.headless.contrib.rest_framework.authentication import (
    XSessionTokenAuthentication,
)


class ExpertsListView(views.APIView):
    """
    GET /experts/
        Returns all experts the authenticated identity is permitted to see.

        Role-based visibility rules
        ---------------------------
        Admin / Coordinator : all experts
        Program Lead        : all experts in their program (any lab)
        Lab Lead / Expert   : experts in the same program + lab combination(s)
                              as the requesting user

    GET /experts/?lab=<id>&program=<id>
        Returns experts assigned to a specific lab + program combination.
        Permitted roles: Admin, Lab Lead
    """

    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def get(self, request, format=None):
        maybe_context = request.headers.get("Context")
        context = json.loads(maybe_context) if maybe_context else {}

        lab_id = request.query_params.get("lab")
        program_id = request.query_params.get("program")

        expert_role = Role.objects.filter(name=ROLE.EXPERT).first()
        if not expert_role:
            return Response(data={"message": "Expert role not configured"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            expert_assignments = self._resolve_assignments(
                request, context, expert_role, lab_id, program_id
            )
        except PermissionError:
            return Response(status=status.HTTP_403_FORBIDDEN)
        except ValueError as e:
            return Response(data={"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(data={"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if expert_assignments is None:
            return Response(status=status.HTTP_403_FORBIDDEN)

        experts_data = []
        for assignment in expert_assignments:
            expert_user = assignment.user
            data = {
                "id": expert_user.pk,
                "name": expert_user.name,
                "email": expert_user.email,
                "lab": LabSerializer(assignment.instance).data,
                "program": ProgramSerializer(assignment.program).data,
                "expertises": self._build_expertise_list(assignment),
            }

            expert_requests = Request.objects.filter(expert=expert_user)
            active_requests = expert_requests.exclude(owner=None)
            data["active_requests_count"] = active_requests.count()
            data["total_requests_count"] = expert_requests.count()

            experts_data.append(data)

        return Response(data=experts_data, status=status.HTTP_200_OK)

    def _resolve_assignments(self, request, context, expert_role, lab_id, program_id):
        """Return the LabRoleAssignment queryset for experts the caller may see.

        Raises PermissionError when the caller lacks access.
        Raises ValueError when a required context field is missing.
        """
        if lab_id and program_id:
            # Specific lab + program lookup — Admin or Lab Lead only
            if not (IsAdmin().has_permission(request) or IsLabLead().has_permission(request)):
                raise PermissionError
            return LabRoleAssignment.objects.filter(
                role=expert_role,
                instance_id=lab_id,
                program_id=program_id,
            )

        if IsAdmin().has_permission(request) or IsCoordinator().has_permission(request):
            return LabRoleAssignment.objects.filter(role=expert_role)

        if IsProgramLead().has_permission(request):
            program_id = context.get("instance")
            if not program_id:
                raise ValueError("Please include identity context with request")
            return LabRoleAssignment.objects.filter(role=expert_role, program_id=program_id)

        if IsLabLead().has_permission(request) or IsExpert().has_permission(request):
            lab_id = context.get("instance")
            if not lab_id:
                raise ValueError("Please include identity context with request")
            role_name = ROLE.LAB_LEAD if IsLabLead().has_permission(request) else ROLE.EXPERT
            caller_role = Role.objects.filter(name=role_name).first()
            if not caller_role:
                raise PermissionError
            # Find the caller's own assignments for this lab to derive their program(s)
            caller_assignments = LabRoleAssignment.objects.filter(
                user=request.user,
                role=caller_role,
                instance_id=lab_id,
            )
            if not caller_assignments.exists():
                raise PermissionError
            # Build a query matching all program + lab combos the caller belongs to
            combo_filter = Q()
            for ca in caller_assignments:
                combo_filter |= Q(instance=ca.instance, program=ca.program)
            return LabRoleAssignment.objects.filter(combo_filter, role=expert_role)

        raise PermissionError

    @staticmethod
    def _build_expertise_list(assignment):
        return ExpertiseSerializer(Expertise.objects.filter(lab_role_assignment=assignment), many=True).data
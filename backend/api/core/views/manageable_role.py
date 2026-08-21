from allauth.headless.contrib.rest_framework.authentication import (
    XSessionTokenAuthentication,
)
from django.db.models import Q
from rest_framework import authentication, permissions, status, views
from rest_framework.response import Response

from core.constants import ROLE
from core.models import (
    Expertise,
    Lab,
    LabRoleAssignment,
    Program,
    ProgramRoleAssignment,
    Role,
    SystemRoleAssignment,
    User,
)
from core.serializers import LabSerializer, ProgramSerializer, RoleSerializer


def _user_data(user):
    return {"id": user.id, "email": user.email, "name": user.name}


def _assignment_data(assignment, location):
    data = {
        "assignment_id": assignment.id,
        "location": location,
        "user": _user_data(assignment.user),
        "role": RoleSerializer(assignment.role).data,
        "date_assigned": assignment.date_assigned,
    }
    if location == "program":
        data["instance"] = ProgramSerializer(assignment.instance).data
    if location == "lab":
        data["instance"] = LabSerializer(assignment.instance).data
        data["program"] = ProgramSerializer(assignment.program).data
    return data


class ManageableRoleListView(views.APIView):
    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def _is_admin(self, request):
        return SystemRoleAssignment.objects.filter(
            user=request.user, role__name=ROLE.ADMIN
        ).exists()

    def _managed_program_ids(self, request):
        if self._is_admin(request):
            return list(Program.objects.values_list("id", flat=True))
        return list(
            ProgramRoleAssignment.objects.filter(
                user=request.user,
                role__name=ROLE.PROGRAM_LEAD,
            ).values_list("instance_id", flat=True)
        )

    def _can_manage_program(self, request, program_id):
        return self._is_admin(request) or program_id in self._managed_program_ids(
            request
        )

    def _manageable_role_names(self, request):
        names = [ROLE.EXPERT, ROLE.LAB_LEAD]
        if self._is_admin(request):
            names.append(ROLE.PROGRAM_LEAD)
        return names

    def _role_is_manageable(self, request, role, location):
        if location == "program":
            return self._is_admin(request) and role.name == ROLE.PROGRAM_LEAD
        return role.name in [ROLE.EXPERT, ROLE.LAB_LEAD]

    def _get_lab_program_id(self, lab_id, explicit_program_id=None):
        if explicit_program_id:
            program = Program.objects.filter(
                pk=explicit_program_id, labs__id=lab_id
            ).first()
        else:
            program = Program.objects.filter(labs__id=lab_id).first()
        return program.id if program else None

    def get(self, request, format=None):
        program_ids = self._managed_program_ids(request)
        if not program_ids:
            return Response(status=status.HTTP_204_NO_CONTENT)

        program_assignments = ProgramRoleAssignment.objects.none()
        if self._is_admin(request):
            program_assignments = ProgramRoleAssignment.objects.filter(
                instance_id__in=program_ids,
                role__name__in=[ROLE.PROGRAM_LEAD],
            ).select_related("user", "role", "instance")
        lab_assignments = LabRoleAssignment.objects.filter(
            program_id__in=program_ids,
            role__name__in=[ROLE.EXPERT, ROLE.LAB_LEAD],
        ).select_related("user", "role", "instance", "program")

        programs = Program.objects.filter(id__in=program_ids).prefetch_related("labs")
        labs = Lab.objects.filter(programs__id__in=program_ids).distinct()
        users = User.objects.filter(
            Q(programroleassignment__instance_id__in=program_ids)
            | Q(labroleassignment__program_id__in=program_ids)
            | Q(systemroleassignment__role__name=ROLE.ADMIN)
        ).distinct()
        if self._is_admin(request):
            users = User.objects.all()

        assignments = [
            *[
                _assignment_data(assignment, "program")
                for assignment in program_assignments
            ],
            *[_assignment_data(assignment, "lab") for assignment in lab_assignments],
        ]

        return Response(
            data={
                "assignments": assignments,
                "users": [_user_data(user) for user in users.order_by("name", "email")],
                "programs": ProgramSerializer(
                    programs.order_by("name"), many=True
                ).data,
                "labs": LabSerializer(labs.order_by("name"), many=True).data,
                "roles": RoleSerializer(
                    Role.objects.filter(
                        name__in=self._manageable_role_names(request)
                    ).order_by("name"),
                    many=True,
                ).data,
                "is_admin": self._is_admin(request),
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request, format=None):
        role = Role.objects.filter(pk=request.data.get("role")).first()
        user = User.objects.filter(pk=request.data.get("user")).first()
        location = request.data.get("location")
        program_id = request.data.get("program")
        lab_id = request.data.get("lab")

        if (
            not role
            or not user
            or not self._role_is_manageable(request, role, location)
        ):
            return Response(
                data={"message": "Invalid user or role."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if location == "program":
            if not self._can_manage_program(request, program_id):
                return Response(
                    data={
                        "message": "You do not have permission to manage this program."
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )
            program = Program.objects.filter(pk=program_id).first()
            if not program:
                return Response(
                    data={"message": "Invalid program."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            assignment, _ = ProgramRoleAssignment.objects.get_or_create(
                user=user, role=role, instance=program
            )
            return Response(
                data=_assignment_data(assignment, "program"),
                status=status.HTTP_201_CREATED,
            )

        if location == "lab":
            resolved_program_id = self._get_lab_program_id(lab_id, program_id)
            if not resolved_program_id or not self._can_manage_program(
                request, resolved_program_id
            ):
                return Response(
                    data={"message": "You do not have permission to manage this lab."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            lab = Lab.objects.filter(pk=lab_id).first()
            program = Program.objects.filter(pk=resolved_program_id).first()
            assignment, _ = LabRoleAssignment.objects.get_or_create(
                user=user, role=role, instance=lab, program=program
            )
            return Response(
                data=_assignment_data(assignment, "lab"), status=status.HTTP_201_CREATED
            )

        return Response(
            data={"message": "Invalid role location."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def patch(self, request, format=None):
        assignment_id = request.data.get("assignment_id")
        location = request.data.get("location")
        user = User.objects.filter(pk=request.data.get("user")).first()
        role = Role.objects.filter(pk=request.data.get("role")).first()

        if (
            not user
            or not role
            or not self._role_is_manageable(request, role, location)
        ):
            return Response(
                data={"message": "Invalid user or role."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if location == "program":
            assignment = ProgramRoleAssignment.objects.filter(pk=assignment_id).first()
            program = Program.objects.filter(pk=request.data.get("program")).first()
            if not assignment or not program:
                return Response(
                    data={"message": "Invalid assignment or program."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if not self._can_manage_program(
                request, assignment.instance_id
            ) or not self._can_manage_program(request, program.id):
                return Response(
                    data={
                        "message": "You do not have permission to edit this assignment."
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )
            assignment.user = user
            assignment.role = role
            assignment.instance = program
            assignment.save()
            return Response(
                data=_assignment_data(assignment, "program"), status=status.HTTP_200_OK
            )

        if location == "lab":
            assignment = LabRoleAssignment.objects.filter(pk=assignment_id).first()
            lab = Lab.objects.filter(pk=request.data.get("lab")).first()
            program_id = self._get_lab_program_id(
                request.data.get("lab"), request.data.get("program")
            )
            program = Program.objects.filter(pk=program_id).first()
            if not assignment or not lab or not program:
                return Response(
                    data={"message": "Invalid assignment, lab, or program."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if not self._can_manage_program(
                request, assignment.program_id
            ) or not self._can_manage_program(request, program.id):
                return Response(
                    data={
                        "message": "You do not have permission to edit this assignment."
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )
            Expertise.objects.filter(lab_role_assignment=assignment).delete()
            assignment.user = user
            assignment.role = role
            assignment.instance = lab
            assignment.program = program
            assignment.save()
            return Response(
                data=_assignment_data(assignment, "lab"), status=status.HTTP_200_OK
            )

        return Response(
            data={"message": "Invalid role location."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, format=None):
        assignment_id = request.data.get("assignment_id")
        location = request.data.get("location")
        if location == "program":
            assignment = ProgramRoleAssignment.objects.filter(pk=assignment_id).first()
            if not assignment:
                return Response(
                    data={"message": "Invalid assignment."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            if not self._can_manage_program(request, assignment.instance_id):
                return Response(
                    data={
                        "message": "You do not have permission to revoke this assignment."
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )
            assignment.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        if location == "lab":
            assignment = LabRoleAssignment.objects.filter(pk=assignment_id).first()
            if not assignment:
                return Response(
                    data={"message": "Invalid assignment."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            if not self._can_manage_program(request, assignment.program_id):
                return Response(
                    data={
                        "message": "You do not have permission to revoke this assignment."
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )
            Expertise.objects.filter(lab_role_assignment=assignment).delete()
            assignment.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        return Response(
            data={"message": "Invalid role location."},
            status=status.HTTP_400_BAD_REQUEST,
        )

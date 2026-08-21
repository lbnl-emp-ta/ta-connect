from allauth.headless.contrib.rest_framework.authentication import (
    XSessionTokenAuthentication,
)
from rest_framework import authentication, permissions, status, views
from rest_framework.response import Response

from core.constants import ROLE
from core.models import Expertise, LabRoleAssignment
from core.serializers import ExpertiseSerializer, ExpertiseWriteSerializer


class ExpertiseUpdateView(views.APIView):
    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def post(self, request, lab_role_assignment_id, format=None):
        try:
            assignment = LabRoleAssignment.objects.select_related("role").get(pk=lab_role_assignment_id)
        except LabRoleAssignment.DoesNotExist:
            return Response(
                data={"message": "Lab role assignment with given ID does not exist."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if assignment.user_id != request.user.pk:
            return Response(
                data={"message": "You do not have permission to edit expertises for this assignment."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if assignment.role.name != ROLE.EXPERT:
            return Response(
                data={"message": "Expertises can only be set on Expert role assignments."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        raw_expertises = request.data
        if not isinstance(raw_expertises, list):
            return Response(
                data={"message": "Request body must be an array of expertises."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ExpertiseWriteSerializer(data=raw_expertises, many=True)
        if not serializer.is_valid():
            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        Expertise.objects.filter(lab_role_assignment=assignment).delete()

        new_expertises = [
            Expertise(
                user=assignment.user,
                lab_role_assignment=assignment,
                topic=item["topic"],
                depth=item["depth"],
            )
            for item in serializer.validated_data
        ]
        Expertise.objects.bulk_create(new_expertises)

        updated = Expertise.objects.filter(lab_role_assignment=assignment).select_related("topic", "depth")
        return Response(
            data=ExpertiseSerializer(updated, many=True).data,
            status=status.HTTP_200_OK,
        )

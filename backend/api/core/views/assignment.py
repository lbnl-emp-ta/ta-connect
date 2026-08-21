from django.db import transaction
from rest_framework import status
from rest_framework.response import Response

from core.constants import DOMAINTYPE, REQUEST_STATUS
from core.models import *
from core.models.audit_history import ActionType
from core.permissions import *
from core.utils import create_audit_history, get_status
from core.views.request import BaseUserAwareRequest


class AssignmentView(BaseUserAwareRequest):
    def post(self, request, request_id=None):
        body = request.data

        if not body:
            return Response(
                data={
                    "message": "Please provide a body for assignment which includes an owner ID."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        owner_id = body.get("owner")

        if not request_id:
            return Response(
                data={"message": "Please provide a request ID for assignment."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not owner_id:
            return Response(
                data={"message": "Please provide an owner ID for assignment."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        actionable_requests = self.get_actionable()

        ta_request, err = self.get_request_or_error(Request.objects.all(), request_id)
        if err:
            return err

        if (not actionable_requests) or (not actionable_requests.filter(id=request_id)):
            return Response(
                data={
                    "message": "Request is not actionable for the current user identity."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if owner_id:
            new_owner = None
            try:
                new_owner = Owner.objects.get(pk=owner_id)
            except Owner.DoesNotExist:
                return Response(
                    data={"message": "Owner with given ID does not exist."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                closeout_form = None
                match new_owner.domain_type:
                    case DOMAINTYPE.RECEPTION:
                        if not (
                            CanAssignForwardToReception().has_object_permission(
                                self.request, self, ta_request
                            )
                            or CanAssignBackToReception().has_object_permission(
                                self.request, self, ta_request
                            )
                        ):
                            return Response(
                                data={
                                    "message": "Insufficient privilege to assign to reception."
                                },
                                status=status.HTTP_401_UNAUTHORIZED,
                            )
                        ta_request.owner = new_owner
                        # Resetting prior assignments if request kicked back to Reception
                        ta_request.program = None
                        ta_request.lab = None
                        ta_request.expert = None

                        # Request is being kicked back to reception from program
                        if ta_request.status.name in [
                            REQUEST_STATUS.ASSIGNED_TO_PROGRAM,
                            REQUEST_STATUS.REJECTED_BY_LAB,
                        ]:
                            ta_request.status = get_status(
                                REQUEST_STATUS.REJECTED_BY_PROGRAM
                            )
                        # Request is being assigned to reception for the first time or being reopened
                        else:
                            ta_request.status = get_status(REQUEST_STATUS.SCOPING)
                    case DOMAINTYPE.PROGRAM:
                        # Request is being kicked back to the program from the lab
                        if ta_request.status.name in [
                            REQUEST_STATUS.ASSIGNED_TO_LAB,
                            REQUEST_STATUS.REJECTED_BY_EXPERT,
                        ]:
                            if not CanAssignBackToProgram().has_object_permission(
                                self.request, self, ta_request
                            ):
                                return Response(
                                    data={
                                        "message": "Insufficient privilege to assign to program."
                                    },
                                    status=status.HTTP_401_UNAUTHORIZED,
                                )
                            ta_request.status = get_status(
                                REQUEST_STATUS.REJECTED_BY_LAB
                            )
                            ta_request.lab = None
                        # Request is being forwarded to the program from the lab after reviewing closeout
                        elif (
                            ta_request.status.name
                            == REQUEST_STATUS.CLOSEOUT_REVIEW_BY_LAB
                        ):
                            if not CanApproveCloseoutByLab().has_object_permission(
                                self.request, self, ta_request
                            ):
                                return Response(
                                    data={
                                        "message": "Insufficient privilege to approve closeout and assign to program."
                                    },
                                    status=status.HTTP_401_UNAUTHORIZED,
                                )
                            ta_request.status = get_status(
                                REQUEST_STATUS.CLOSEOUT_REVIEW_BY_PROGRAM
                            )
                        # Request is being assigned to program for the first time
                        else:
                            if not CanAssignForwardToProgram().has_object_permission(
                                self.request, self, ta_request
                            ):
                                return Response(
                                    data={
                                        "message": "Insufficient privilege to assign to program."
                                    },
                                    status=status.HTTP_401_UNAUTHORIZED,
                                )
                            ta_request.status = get_status(
                                REQUEST_STATUS.ASSIGNED_TO_PROGRAM
                            )
                        ta_request.owner = new_owner
                        ta_request.program = new_owner.program

                    case DOMAINTYPE.LAB:
                        # Request is being assigned to lab for the first time
                        if ta_request.status.name in [
                            REQUEST_STATUS.ASSIGNED_TO_PROGRAM,
                            REQUEST_STATUS.REJECTED_BY_LAB,
                        ]:
                            if not CanAssignForwardToLab().has_object_permission(
                                self.request, self, ta_request
                            ):
                                return Response(
                                    data={
                                        "message": "Insufficient privilege to assign to lab."
                                    },
                                    status=status.HTTP_401_UNAUTHORIZED,
                                )
                            ta_request.status = get_status(
                                REQUEST_STATUS.ASSIGNED_TO_LAB
                            )
                            ta_request.expert = None
                        # Request is being kicked back to lab from expert
                        elif ta_request.status.name in [
                            REQUEST_STATUS.ASSIGNED_TO_EXPERT,
                            REQUEST_STATUS.PROVIDING_TA,
                        ]:
                            if not CanAssignBackToLab().has_object_permission(
                                self.request, self, ta_request
                            ):
                                return Response(
                                    data={
                                        "message": "Insufficient privilege to assign to lab."
                                    },
                                    status=status.HTTP_401_UNAUTHORIZED,
                                )
                            ta_request.status = get_status(
                                REQUEST_STATUS.REJECTED_BY_EXPERT
                            )
                            ta_request.expert = None
                            ta_request.proj_completion_date = None
                        # Request is being forwarded to the lab from the expert after finishing closeout
                        # This technically shouldn't ever happen. Instead this is handled by `RequestSubmitCloseoutFormView``
                        elif ta_request.status.name in [
                            REQUEST_STATUS.CLOSEOUT_STARTED,
                            REQUEST_STATUS.CLOSEOUT_MORE_INFO,
                        ]:
                            if not CanSubmitCloseout().has_object_permission(
                                self.request, self, ta_request
                            ):
                                return Response(
                                    data={
                                        "message": "Insufficient privilege to submit closeout and assign to lab."
                                    },
                                    status=status.HTTP_401_UNAUTHORIZED,
                                )
                            ta_request.status = get_status(
                                REQUEST_STATUS.CLOSEOUT_REVIEW_BY_LAB
                            )
                        ta_request.owner = new_owner
                        ta_request.lab = new_owner.lab

                    case DOMAINTYPE.EXPERT:
                        # Request is being assigned to expert for the first time
                        if ta_request.status.name in [
                            REQUEST_STATUS.ASSIGNED_TO_LAB,
                            REQUEST_STATUS.REJECTED_BY_EXPERT,
                        ]:
                            if not CanAssignForwardToExpert().has_object_permission(
                                self.request, self, ta_request
                            ):
                                return Response(
                                    data={
                                        "message": "Insufficient privilege to assign an expert."
                                    },
                                    status=status.HTTP_401_UNAUTHORIZED,
                                )
                            ta_request.status = get_status(
                                REQUEST_STATUS.ASSIGNED_TO_EXPERT
                            )
                        # Request is being kicked back to expert by lab or program during closeout review
                        elif ta_request.status.name in [
                            REQUEST_STATUS.CLOSEOUT_REVIEW_BY_LAB,
                            REQUEST_STATUS.CLOSEOUT_REVIEW_BY_PROGRAM,
                        ]:
                            if not (
                                CanRejectCloseoutByLab().has_object_permission(
                                    self.request, self, ta_request
                                )
                                or CanRejectCloseoutByProgram().has_object_permission(
                                    self.request, self, ta_request
                                )
                            ):
                                return Response(
                                    data={
                                        "message": "Insufficient privilege to reject closeout and assign back to expert."
                                    },
                                    status=status.HTTP_401_UNAUTHORIZED,
                                )
                            ta_request.status = get_status(
                                REQUEST_STATUS.CLOSEOUT_MORE_INFO
                            )
                            closeout_form = (
                                ta_request.closeout_form
                                if hasattr(ta_request, "closeout_form")
                                else None
                            )
                            if closeout_form:
                                closeout_form.submitted_date = None
                                closeout_form.approved_by_lab = False
                                closeout_form.approved_by_program = False

                        ta_request.owner = new_owner
                        ta_request.expert = new_owner.expert

                    case _:
                        return Response(
                            data={"message": "Given request's domaintype is invalid"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        )

                with transaction.atomic():
                    if closeout_form:
                        closeout_form.save()
                    ta_request.save()
                    create_audit_history(
                        request,
                        ta_request,
                        ActionType.Assignment,
                        f"Assigned to {new_owner!s} as {new_owner.domain_type}",
                    )

            except Exception as e:
                return Response(
                    data={"message": f"{e}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        return Response(status=status.HTTP_200_OK)

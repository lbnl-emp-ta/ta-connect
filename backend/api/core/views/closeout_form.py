from rest_framework import views, authentication, permissions, status
from rest_framework.response import Response
from django.db import transaction
from django.http import JsonResponse

from core.constants import REQUEST_STATUS
from core.utils import create_audit_history, get_status
from core.models import CloseoutForm, Request
from core.models.audit_history import ActionType
from core.serializers import CloseoutFormSerializer
from core.views.request import BaseUserAwareRequest


class CloseoutFormView(BaseUserAwareRequest):

    def _get_request_obj(self, request_id, request):
        """
        Resolves the Request instance and checks that the caller has at least
        view-level access.  Returns (request_obj, error_response).
        """
        try:
            request_obj = Request.objects.get(pk=request_id)
        except Request.DoesNotExist:
            return None, Response(
                {"message": "Request with given ID does not exist"},
                status=status.HTTP_404_NOT_FOUND,
            )

        actionable = self.get_actionable()
        downstream = self.get_downstream()
        inactive = self.get_inactive()
        visible = actionable | downstream | inactive
        if not visible.filter(pk=request_obj.pk).exists():
            return None, Response(
                {"message": "Insufficient authorization to access closeout form for given request"},
                status=status.HTTP_403_FORBIDDEN,
            )

        return request_obj, None

    def get(self, request, request_id):
        request_obj, err = self._get_request_obj(request_id, request)
        if err:
            return err

        if not hasattr(request_obj, "closeout_form"):
            return JsonResponse(None, safe=False, status=200)

        serializer = CloseoutFormSerializer(request_obj.closeout_form)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, request_id):
        request_obj, err = self._get_request_obj(request_id, request)
        if err:
            return err

        if hasattr(request_obj, "closeout_form"):
            serializer = CloseoutFormSerializer(request_obj.closeout_form)
            return Response(serializer.data, status=status.HTTP_200_OK)

        if not self.get_actionable().filter(pk=request_obj.pk).exists():
            return Response(
                {"message": "Insufficient authorization to create closeout form for given request"},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = CloseoutFormSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            serializer.save(request=request_obj)
            request_obj.status = get_status(REQUEST_STATUS.CLOSEOUT_STARTED)
            request_obj.save()
            create_audit_history(request, request_obj, ActionType.StatusChange, f"Status changed to Closeout Started")

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def patch(self, request, request_id):
        request_obj, err = self._get_request_obj(request_id, request)
        if err:
            return err

        if not self.get_actionable().filter(pk=request_obj.pk).exists():
            return Response(
                {"message": "Insufficient authorization to update closeout form for given request"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # If closeout form doesn't exist, create it.
        # This should only happen if somehow the form gets deleted.
        closeout_form, created = CloseoutForm.objects.get_or_create(request=request_obj)

        serializer = CloseoutFormSerializer(closeout_form, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            serializer.save()
            if created:
                request_obj.status = get_status(REQUEST_STATUS.CLOSEOUT_STARTED)
                request_obj.save()
                create_audit_history(request, request_obj, ActionType.StatusChange, f"Status changed to Closeout Started")

        return Response(serializer.data, status=status.HTTP_200_OK)

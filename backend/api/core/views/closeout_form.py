from rest_framework import views, authentication, permissions, status
from rest_framework.response import Response

from core.models import CloseoutForm, Request
from core.serializers import CloseoutFormSerializer
from core.views.request import BaseUserAwareRequest

from allauth.headless.contrib.rest_framework.authentication import (
    XSessionTokenAuthentication,
)


class CloseoutFormView(views.APIView):
    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
    ]

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

        base = BaseUserAwareRequest(request=request)
        visible = (
            base.get_actionable() | base.get_downstream() | base.get_inactive()
        )
        if not visible.contains(request_obj):
            return None, Response(
                {"message": "Insufficient authorization to access closeout form for given request"},
                status=status.HTTP_403_FORBIDDEN,
            )

        return request_obj, None

    def get(self, request, request_id):
        request_obj, err = self._get_request_obj(request_id, request)
        if err:
            return err

        try:
            closeout_form = request_obj.closeout_form
        except CloseoutForm.DoesNotExist:
            return Response(
                {"message": "No closeout form exists for this request"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = CloseoutFormSerializer(closeout_form)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, request_id):
        request_obj, err = self._get_request_obj(request_id, request)
        if err:
            return err

        if hasattr(request_obj, "closeout_form"):
            return Response(
                {"message": "A closeout form already exists for this request"},
                status=status.HTTP_409_CONFLICT,
            )

        base = BaseUserAwareRequest(request=request)
        if not base.get_actionable().contains(request_obj):
            return Response(
                {"message": "Insufficient authorization to create closeout form for given request"},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = CloseoutFormSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save(request=request_obj)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def patch(self, request, request_id):
        request_obj, err = self._get_request_obj(request_id, request)
        if err:
            return err

        try:
            closeout_form = request_obj.closeout_form
        except CloseoutForm.DoesNotExist:
            return Response(
                {"message": "No closeout form exists for this request"},
                status=status.HTTP_404_NOT_FOUND,
            )

        base = BaseUserAwareRequest(request=request)
        if not base.get_actionable().contains(request_obj):
            return Response(
                {"message": "Insufficient authorization to update closeout form for given request"},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = CloseoutFormSerializer(closeout_form, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

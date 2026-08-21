from allauth.headless.contrib.rest_framework.authentication import (
    XSessionTokenAuthentication,
)
from rest_framework import authentication, permissions, status, views
from rest_framework.generics import ListAPIView
from rest_framework.response import Response

from core.models import *
from core.permissions import *
from core.serializers import CustomerEditSerializer, CustomerSerializer
from core.views.request import BaseUserAwareRequest


class CustomerListView(ListAPIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
        IsAdmin | IsProgramLead | IsCoordinator | IsLabLead,
    ]


class CustomerDetailView(views.APIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
        IsAdmin | IsProgramLead | IsCoordinator | IsLabLead,
    ]

    def patch(self, request, customer_id):
        try:
            customer_obj = Customer.objects.get(pk=customer_id)
        except Customer.DoesNotExist:
            return Response(data={"message": "Customer with given ID does not exist"})

        # Make sure the customer that is being edited is associated with at least
        # one request that the user has a role on. i.e. preventing user from editing arbitrary customers in system.
        customer_relationships = CustomerRequestRelationship.objects.filter(
            customer=customer_obj
        )
        has_permission = False
        for relationship in customer_relationships:
            ta_request = relationship.request
            if CanEditCustomerInfo().has_object_permission(request, self, ta_request):
                has_permission = True
                break

        if not has_permission:
            return Response(
                data={
                    "message": "Insufficient authorization to edit given customer's information"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        customer_patch_data = {}

        if not request.data:
            return Response(
                data={"message": "Missing request body"},
                status=status.HTTP_204_NO_CONTENT,
            )

        if "name" in request.data and (request.data.get("name") is not None):
            customer_patch_data["name"] = request.data.get("name")

        if "email" in request.data and (request.data.get("email") is not None):
            customer_patch_data["email"] = request.data.get("email")

        if "phone" in request.data and (request.data.get("phone") is not None):
            customer_patch_data["phone"] = request.data.get("phone")

        if "title" in request.data and (request.data.get("title") is not None):
            customer_patch_data["title"] = request.data.get("title")

        if "tpr" in request.data and (request.data.get("tpr") is not None):
            try:
                TransmissionPlanningRegion.objects.get(pk=request.data.get("tpr"))
            except TransmissionPlanningRegion.DoesNotExist:
                return Response(
                    data={
                        "message": "Transmission planning region with given ID does not exist"
                    }
                )

            customer_patch_data["tpr"] = request.data.get("tpr")

        if "state" in request.data and (request.data.get("state") is not None):
            try:
                State.objects.get(pk=request.data.get("state"))
            except State.DoesNotExist:
                return Response(data={"message": "State with given ID does not exist"})

            customer_patch_data["state"] = request.data.get("state")

        if "org" in request.data and (request.data.get("org") is not None):
            try:
                Organization.objects.get(pk=request.data.get("org"))
            except Organization.DoesNotExist:
                return Response(
                    data={"message": "Organization with given ID does not exist"}
                )
            customer_patch_data["org"] = request.data.get("org")

        if "orgType" in request.data and (request.data.get("orgType") is not None):
            try:
                OrganizationType.objects.get(pk=request.data.get("orgType"))
            except OrganizationType.DoesNotExist:
                return Response(
                    data={"message": "Organization type with given ID does not exist"}
                )
            customer_patch_data["orgType"] = request.data.get("orgType")

        serializer = CustomerEditSerializer(
            customer_obj, data=customer_patch_data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
        else:
            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            data=CustomerSerializer(Customer.objects.get(pk=customer_id)).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request, customer_id):
        try:
            customer_obj = Customer.objects.get(pk=customer_id)
        except Customer.DoesNotExist:
            return Response(data={"message": "Customer with given ID does not exist"})

        if not CanDeleteCustomer().has_permission(request, self):
            return Response(
                data={"message": "Insufficient authorization to delete given customer"},
                status=status.HTTP_403_FORBIDDEN,
            )

        customer_relationships = CustomerRequestRelationship.objects.filter(
            customer=customer_obj
        )
        customer_relationships.delete()
        customer_obj.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class CustomerCreateView(views.APIView):
    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
        IsAdmin | IsProgramLead | IsCoordinator | IsLabLead | IsExpert,
    ]

    def post(self, request):
        if not request.data:
            return Response(
                data={"message": "Missing request body"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not CanCreateCustomer().has_permission(request, self):
            return Response(
                data={"message": "Insufficient authorization to create customer"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = CustomerEditSerializer(data=request.data)
        if serializer.is_valid():
            customer = serializer.save()
            return Response(
                data=CustomerSerializer(customer).data, status=status.HTTP_201_CREATED
            )
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomerTransferView(BaseUserAwareRequest):
    permission_classes = [
        permissions.IsAuthenticated,
        IsAdmin | IsProgramLead | IsCoordinator | IsLabLead | IsExpert,
    ]

    def post(self, request, request_id=None):
        if not request_id:
            return Response(
                data={"message": "Please provide a request ID for transfer."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not request.data:
            return Response(
                data={"message": "Missing request body with customer_id"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if "customer_id" in request.data and (
            request.data.get("customer_id") is not None
        ):
            customer_id = request.data.get("customer_id")
        else:
            return Response(
                data={"message": "Missing customer_id in request body"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            customer_obj = Customer.objects.get(pk=customer_id)
        except Customer.DoesNotExist:
            return Response(
                data={"message": "Customer with given ID does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ta_request, err = self.get_request_or_error(Request.objects.all(), request_id)
        if err:
            return err

        if not CanTransferCustomer().has_object_permission(request, self, ta_request):
            return Response(
                data={
                    "message": "Insufficient authorization to transfer customer for given request"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        existing_relationship = CustomerRequestRelationship.objects.filter(
            request=ta_request
        ).first()

        if existing_relationship:
            existing_relationship.delete()

        CustomerRequestRelationship.objects.get_or_create(
            request=ta_request, customer=customer_obj, is_poc=True
        )
        ta_request.save()

        return Response(
            data=CustomerSerializer(customer_obj).data, status=status.HTTP_200_OK
        )

from rest_framework import views, authentication, permissions, status
from rest_framework.response import Response

from core.views.request import BaseUserAwareRequest
from core.models import * 
from core.serializers import CustomerSerializer, CustomerEditSerializer
from core.permissions import *

from allauth.headless.contrib.rest_framework.authentication import (
    XSessionTokenAuthentication,
)

class CustomerEditView(views.APIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
        IsAdmin|IsProgramLead|IsCoordinator|IsLabLead
    ]
    
    def post(self, request, customer_id):
        try:
            customer_obj = Customer.objects.get(pk=customer_id)
        except Customer.DoesNotExist:
            return Response(data={"message":"Customer with given ID does not exist"})

        # Making sure the customer that is being edited is associated with a request that is actionable for the user
        # i.e. preventing user from editing arbitrary customers in system 
        if not CustomerRequestRelationship.objects.filter(customer=customer_obj).filter(request__in=BaseUserAwareRequest(request=request).get_actionable()):
            return Response(data={"message": "Insufficient authorization to edit given customer's information"}, status=status.HTTP_400_BAD_REQUEST)

        customer_patch_data = dict() 
        
        if not request.data:
            return Response(data={"message": "Missing request body"}, status=status.HTTP_204_NO_CONTENT)
        
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
                return Response(data={"message":"Transmission planning region with given ID does not exist"})

            customer_patch_data["tpr"] = request.data.get("tpr")

        if "state" in request.data and (request.data.get("state") is not None):
            try:
                State.objects.get(pk=request.data.get("state")) 
            except State.DoesNotExist:
                return Response(data={"message":"State with given ID does not exist"})

            customer_patch_data["state"] = request.data.get("state")

        if "org" in request.data and (request.data.get("org") is not None):
            try:
                Organization.objects.get(pk=request.data.get("org")) 
            except Organization.DoesNotExist:
                return Response(data={"message":"Organization with given ID does not exist"})
            customer_patch_data["org"] = request.data.get("org")
        
        serializer = CustomerEditSerializer(customer_obj, data=customer_patch_data, partial=True)
        if serializer.is_valid():
            serializer.save()
        else:
            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            

        return Response(data=CustomerSerializer(Customer.objects.get(pk=customer_id)).data,status=status.HTTP_200_OK)
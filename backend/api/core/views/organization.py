from rest_framework import views, authentication, permissions, status
from rest_framework.response import Response
from rest_framework.generics import ListAPIView

from core.views.request import BaseUserAwareRequest
from core.models import * 
from core.serializers import OrganizationSerializer, OrganizationEditSerializer
from core.permissions import *

from allauth.headless.contrib.rest_framework.authentication import (
    XSessionTokenAuthentication,
)


class OrganizationListView(ListAPIView):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer

    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
        IsAdmin|IsProgramLead|IsCoordinator|IsLabLead
    ]


class OrganizationDetailView(views.APIView):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer

    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
        IsAdmin|IsProgramLead|IsCoordinator|IsLabLead
    ]
    
    def patch(self, request, organization_id):
        try:
            organization_obj = Organization.objects.get(pk=organization_id)
        except Organization.DoesNotExist:
            return Response(data={"message":"Organization with given ID does not exist"})
        
        # Make sure the organization that is being edited is associated with at least
        # one request that the user has a role on. i.e. preventing user from editing arbitrary organizations in system.
        organization_requests = organization_obj.requests.all()
        has_permission = False
        for ta_request in organization_requests:
            if CanEditOrganizationInfo().has_object_permission(request, self, ta_request):
                has_permission = True
                break

        if not has_permission:
            return Response(data={"message": "Insufficient authorization to edit given organization's information"}, status=status.HTTP_400_BAD_REQUEST)

        organization_patch_data = dict() 
        
        if not request.data:
            return Response(data={"message": "Missing request body"}, status=status.HTTP_204_NO_CONTENT)
        
        if "name" in request.data and (request.data.get("name") is not None):
            organization_patch_data["name"] = request.data.get("name")
        
        if "address" in request.data and (request.data.get("address") is not None):
            organization_patch_data["address"] = request.data.get("address")

        if "transmission_planning_region" in request.data and (request.data.get("transmission_planning_region") is not None):
            organization_patch_data["transmission_planning_region"] = request.data.get("transmission_planning_region")

        if "state" in request.data and (request.data.get("state") is not None):
            organization_patch_data["state"] = request.data.get("state")

        if "tpr" in request.data and (request.data.get("tpr") is not None):
            try:
                TransmissionPlanningRegion.objects.get(pk=request.data.get("tpr")) 
            except TransmissionPlanningRegion.DoesNotExist:
                return Response(data={"message":"Transmission planning region with given ID does not exist"})

            organization_patch_data["tpr"] = request.data.get("tpr")

        if "state" in request.data and (request.data.get("state") is not None):
            try:
                State.objects.get(pk=request.data.get("state")) 
            except State.DoesNotExist:
                return Response(data={"message":"State with given ID does not exist"})

            organization_patch_data["state"] = request.data.get("state")
        
        serializer = OrganizationEditSerializer(organization_obj, data=organization_patch_data, partial=True)
        if serializer.is_valid():
            serializer.save()
        else:
            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            

        return Response(data=OrganizationSerializer(Organization.objects.get(pk=organization_id)).data,status=status.HTTP_200_OK)
    

class OrganizationCreateView(views.APIView):
    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
        IsAdmin|IsProgramLead|IsCoordinator|IsLabLead
    ]

    def post(self, request):
        if not request.data:
            return Response(data={"message": "Missing request body"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = OrganizationEditSerializer(data=request.data)
        if serializer.is_valid():
            organization = serializer.save()
            return Response(data=OrganizationSerializer(organization).data, status=status.HTTP_201_CREATED)
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OrganizationTransferView(BaseUserAwareRequest):
    permission_classes = [
        permissions.IsAuthenticated,
        IsAdmin|IsProgramLead|IsCoordinator|IsLabLead|IsExpert
    ]

    def post(self, request, request_id=None):
        if not request_id:
            return Response(data={"message": "Please provide a request ID for transfer."}, status=status.HTTP_400_BAD_REQUEST)

        if not request.data:
            return Response(data={"message": "Missing request body with organization_id"}, status=status.HTTP_400_BAD_REQUEST)
        
        if "organization_id" in request.data and (request.data.get("organization_id") is not None):
            organization_id = request.data.get("organization_id")
        else:
            return Response(data={"message": "Missing organization_id in request body"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            organization_obj = Organization.objects.get(pk=organization_id)
        except Organization.DoesNotExist:
            return Response(data={"message":"Organization with given ID does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        ta_request, err = self.get_request_or_error(Request.objects.all(), request_id)
        if err:
            return err
        
        if not CanTransferOrganization().has_object_permission(request, self, ta_request):
            return Response(data={"message": "Insufficient authorization to transfer organization for given request"}, status=status.HTTP_400_BAD_REQUEST)
        
        ta_request.organization = organization_obj
        ta_request.save()

        return Response(data=OrganizationSerializer(organization_obj).data,status=status.HTTP_200_OK)
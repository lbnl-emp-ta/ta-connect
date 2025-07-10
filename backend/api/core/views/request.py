from rest_framework import views, status, permissions, authentication
from rest_framework.response import Response
from core.serializers import * 
from core.models import * 
from core.permissions import *

from allauth.headless.contrib.rest_framework.authentication import (
    XSessionTokenAuthentication,
)

class BaseUserAwareRequest(views.APIView):
    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def get_queryset(self):
        queryset = Request.objects.all()

        # admins can see all requests
        if IsAdmin().has_permission(self.request, self):
            return queryset

        maybe_context = self.request.headers.get("Context")
        if maybe_context is None:
            return queryset.none()
            
        context = json.loads(maybe_context)

        if not context:
            return queryset.none()

        if not (context.get("user") == self.request.user.id): # user is trying to impersonate another user
            return queryset.none()

        user = User.objects.get(pk=self.request.user.id)

        reception_assignments = ReceptionRoleAssignment.objects.filter(user=user)
        program_assignments = ProgramRoleAssignment.objects.filter(user=user)
        lab_assignments = LabRoleAssignment.objects.filter(user=user)

        visible_requests = queryset.none() 

        if  IsCoordinator().has_permission(self.request, self):
            COORDINATOR_ROLE = Role.objects.get(name="Coordinator")
            coordinator_assignments = reception_assignments.filter(role=COORDINATOR_ROLE)
            for assignment in coordinator_assignments:
                    visible_requests = visible_requests.union(assignment.instance.owner.request_set.all())

        elif IsProgramLead().has_permission(self.request, self):
            PROGRAM_LEAD_ROLE = Role.objects.get(name="Program Lead")
            program_lead_assignments = program_assignments.filter(role=PROGRAM_LEAD_ROLE)
            for assignment in program_lead_assignments:
                    visible_requests = visible_requests.union(assignment.instance.owner.request_set.all())

        elif IsLabLead().has_permission(self.request, self):
            LAB_LEAD_ROLE = Role.objects.get(name="Lab Lead")
            lab_lead_assignments = lab_assignments.filter(role=LAB_LEAD_ROLE)
            for assignment in lab_lead_assignments:
                    visible_requests = visible_requests.union(assignment.instance.owner.request_set.all())

        elif IsExpert().has_permission(self.request, self):
            EXPERT_ROLE = Role.objects.get(name="Expert")
            expert_assignments = lab_assignments.filter(role=EXPERT_ROLE)
            for assignment in expert_assignments:
                    visible_requests = visible_requests.union(assignment.instance.owner.request_set.all())

        return visible_requests 

class RequestDetailView(BaseUserAwareRequest):
    serializer = RequestDetailSerializer() 

    def get(self, request, format=None, id=None):
        queryset= self.get_queryset()

        if id is None:
            return Response(data={"message": "Please provide a Request ID"}, status=status.HTTP_400_BAD_REQUEST)

        found_request = None
        try:
            found_request = queryset.get(pk=id)        
        except:
            return Response(data={"message": "Request with given ID does not exist"}, status=status.HTTP_404_NOT_FOUND)

        customers = found_request.customers 
        customer_serializer = CustomerSerializer(customers, many=True)

        request_serializer = RequestSerializer(found_request)

        response_data = dict()
        response_data = response_data | request_serializer.data 
        response_data["customers"] = customer_serializer.data

        return Response(data=response_data, status=status.HTTP_200_OK)

    def patch(self, request, id=None):
        queryset = self.get_queryset()

        maybe_context = self.request.headers.get("Context")
        if maybe_context is None:
            return Response(data={"message": "Please provide context object header with request"}, status=status.HTTP_400_BAD_REQUEST)
            
        context = json.loads(maybe_context)

        if id is None:
            return Response(data={"message": "Please provide a Request ID"}, status=status.HTTP_400_BAD_REQUEST)
        
        maybe_request = None
        try:
            maybe_request = queryset.get(pk=id)        
        except Request.DoesNotExist:
            return Response(data={"message": "Request with given ID does not exist"}, status=status.HTTP_404_NOT_FOUND)

        body = json.loads(request.body)

        patch_data = dict()

        if not body:
            return Response(data={"message": "Missing request body"}, status=status.HTTP_204_NO_CONTENT)
        
        if "description" in body:
            if not (IsAdmin().has_permission(request, None) or IsProgramLead().has_permission(request, None) or IsCoordinator().has_permission(request, None)):
                return Response(data={"message": "Insufficient privillege to update 'description' field"}, status=status.HTTP_401_UNAUTHORIZED)
            
            new_description_data = body.get("description")
            if new_description_data is None:
                new_description_data = ""

            patch_data["description"] = new_description_data 

        if "depth" in body:
            if not (IsAdmin().has_permission(request, None) or IsProgramLead().has_permission(request, None)):
                return Response(data={"message": "Insufficient privillege to update 'depth' field"}, status=status.HTTP_401_UNAUTHORIZED)
            
            if body.get("depth") is None:
                return Response(data={"message": "Cannot clear depth field on a request. Need to provide a valid replacement value."}, status=status.HTTP_401_UNAUTHORIZED)
            
            maybe_depth = None
            try:
                maybe_depth = Depth.objects.get(name=body.get("depth"))
            except Depth.DoesNotExist:
                return Response(data={"message": "Provided depth does not exist."}, status=status.HTTP_400_BAD_REQUEST)

            patch_data["depth"] = maybe_depth.name

        if "actual_completion_date" in body:
            if not (IsAdmin().has_permission(request, None) or IsProgramLead().has_permission(request, None)):
                return Response(data={"message": "Insufficient privillege to update 'depth' field"}, status=status.HTTP_401_UNAUTHORIZED)

            patch_data["actual_completion_date"] = body.get("actual_completion_date") 

        if "expert" in body:
            if not(IsAdmin().has_permission(request, None) or IsLabLead().has_permission(request, None)):
                return Response(data={"message": "Insufficient privillege to update 'expert' field"}, status=status.HTTP_401_UNAUTHORIZED)
            
            new_expert_data = body.get("expert")
            if new_expert_data is not None:
                maybe_expert = None
                try:
                    maybe_expert = User.objects.get(pk=new_expert_data)
                except User.DoesNotExist:
                    return Response(data={"message": "Provided user in expert field does not exist."}, status=status.HTTP_400_BAD_REQUEST)
                
                # Need to check provided user has expert role
                try:
                    # if they are lab lead, check to see if expert is in their lab
                    if IsLabLead().has_permission(request, None):
                        LabRoleAssignment.objects.get(user=maybe_expert, role=Role.objects.get(name="Expert"), instance=Lab.objects.get(pk=context.get("instance")))

                    # if they are admin best we can do is check if they are an expert
                    else:
                        LabRoleAssignment.objects.get(user=maybe_expert, role=Role.objects.get(name="Expert"))

                except LabRoleAssignment.DoesNotExist:
                    return Response(data={"message": "Provided user in expert field does not not have expert role."}, status=status.HTTP_400_BAD_REQUEST)

                except Lab.DoesNotExist:
                    return Response(data={"message": "Provided expert does not reside in your lab role exist."}, status=status.HTTP_400_BAD_REQUEST)
                

            patch_data["expert"] = maybe_expert.email 
        
        if "proj_start_date" in body:
            if not(IsAdmin().has_object_permission(request, None) or IsProgramLead().has_permission(request, None) or IsLabLead().has_permission(request, None) or IsExpert().has_permission(request, None)):
                return Response(data={"message": "Insufficient privillege to update 'expert' field"}, status=status.HTTP_401_UNAUTHORIZED)

            patch_data["proj_start_date"] = body.get("proj_start_date")

        if "proj_completion_date" in body:
            if not(IsAdmin().has_object_permission(request, None) or IsProgramLead().has_permission(request, None) or IsLabLead().has_permission(request, None) or IsExpert().has_permission(request, None)):
                return Response(data={"message": "Insufficient privillege to update 'expert' field"}, status=status.HTTP_401_UNAUTHORIZED)

            patch_data["proj_completion_date"] = body.get("proj_completion_date")

        # if body.get("owner"):
            
        #     maybe_owner = None
        #     try:
        #         maybe_owner = Owner.objects.get(pk=body.get("owner"))
        #     except Owner.DoesNotExist:
        #         return Response(data={"message": "Provided owner does not exist."}, status=status.HTTP_400_BAD_REQUEST)

        #     patch_data["owner"] = maybe_owner.pk 
        
            
        if "status" in body:
            if body.get("status") is None:
                return Response(data={"message": "Cannot clear status field on request. Need to provide value replacement value."}, status=status.HTTP_400_BAD_REQUEST)

            maybe_status = None
            try:
                maybe_status = RequestStatus.objects.get(pk=body.get("status"))
            except RequestStatus.DoesNotExist:
                return Response(data={"message": "Provided status does not exist."}, status=status.HTTP_400_BAD_REQUEST)

            patch_data["status"] = maybe_status.name 
    
        
       # do partial save with accumulated patch 
        patch_serializer = RequestSerializer(instance=maybe_request, data=patch_data, partial=True)
        if(patch_serializer.is_valid()):
            patch_serializer.save() 
        else:
            return Response(data={"message": patch_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


        return self.get(request, None, id)


class RequestListView(BaseUserAwareRequest):
    serializer = RequestSerializer
    
    # we want id, date_created, status, depth, poc customer name, poc customer email, expert
    # also we filter on search params
    def get(self, request, format=None):
        queryset = self.get_queryset()

        # filter requests based on search params
        # user = self.kwargs.get("user")
        # role = self.kwargs.get("role")
        # location = self.kwargs.get("location")
        # instance = self.kwargs.get("instance")

        # Unused for now
        # if user is not None:
        #     queryset = queryset.filter(user=User.objects.get(user))
        
        # if role is not None:
        #     queryset = queryset.filter(role=Role.objects.get(name=role.lower().capitalize()))
        
        # if location is not None:
        #     location_filter = None
        #     match location.lower():
        #         case "reception":
        #             location_filter = "Reception"
        #             pass
        #         case "program":
        #             location_filter = "Program"
        #             pass
        #         case "lab":
        #             location_filter = "Lab"
        #             pass
            
        #     if location_filter is not None:
        #         queryset = queryset.filter(owner__domain_type=location_filter)

        #     if instance is not None:
        #         reception_queryset = queryset.filter(owner__reception=Reception.objects.get(instance))
        #         program_queryset = queryset.filter(owner__program=Program.objects.get(instance))
        #         lab_queryset = queryset.filter(owner__lab=Lab.objects.get(instance))

        #         queryset = reception_queryset | program_queryset | lab_queryset
            
                
        
        serializer = RequestListSerializer(queryset, many=True)
        response_data = list() 
        for request in serializer.data:
            data = request
            poc_customer = Request.objects.get(pk=request["id"]).customerrequestrelationship_set.filter(customer_type=CustomerType.objects.get(name="Primary Contact")).first().customer
            data["customer_name"] = poc_customer.name 
            data["customer_email"] = poc_customer.email 
            response_data.append(data)
        
        return Response(data=response_data, status=status.HTTP_200_OK)


# class RequestCreateView(generics.CreateAPIView):
#     queryset = Request.objects.all().select_related("status", "depth", "owner")
#     serializer_class = RequestSerializer

#     authentication_classes = [
#         authentication.SessionAuthentication,
#         XSessionTokenAuthentication,
#     ]

#     permission_classes = [
#         permissions.IsAuthenticated,
#     ]

    
#     def post(self, request):
#         imcoming_fields_to_keep = ["description", "depth"]
#         incoming_data = request.data.copy()
        
#         # Filter incoming fields
#         for field in request.data:
#             if field not in imcoming_fields_to_keep:
#                 incoming_data.pop(field)
        
#         # ** From source code of CreateModelMixin **
#         serializer = self.get_serializer(data=incoming_data)
#         serializer.is_valid(raise_exception=True)
#         self.perform_create(serializer)
#         headers = self.get_success_headers(serializer.data)
        
#         outgoing_fields_to_keep = ["description", "depth", "date_created"]
#         outgoing_data = serializer.data.copy()
        
#         # Filter outgoing fields
#         for field in serializer.data:
#             if field not in outgoing_fields_to_keep:
#                 outgoing_data.pop(field)
                
#         return Response(outgoing_data, status=status.HTTP_201_CREATED, headers=headers)

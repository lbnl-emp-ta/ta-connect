from rest_framework import views, status, permissions, authentication
from rest_framework.response import Response
from core.serializers import * 
from core.models import * 
from core.permissions import *
from core.constants import ROLE

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

    def get_actionable(self):
        return self.get_queryset()
    
    def get_downstream(self):
        queryset = Request.objects.all()

        maybe_context = self.request.headers.get("Context")
        if not maybe_context:
            return queryset.none()

        context = json.loads(maybe_context) 

        actionable_pks = [request.pk for request in self.get_actionable()]

        # This is a convention, we assume all requests for admin are 
        # "actionable" and none are "downstream". In reality, this 
        # concept doesn't really apply to Admins.
        if IsAdmin().has_permission(self.request):
            return queryset.none()

        # All requests that are in the system, excluding ones that have been 
        # archived (i.e. no owner) or are owned by Reception currently 
        # (i.e. are actionable).
        elif IsCoordinator().has_permission(self.request):
            return queryset.exclude(owner=None).exclude(pk__in=actionable_pks)

        elif IsProgramLead().has_permission(self.request):
            program = None
            try:
                program = Program.objects.get(pk=context.get("instance"))
            except Program.DoesNotExist:
                return queryset.none()
            
            program_downstream = queryset.none()
            for lab in program.labs.all():
                # Take all requests owned by Labs associated with this 
                # Program, and filter all requests that are also
                # associated with this Program.
                program_downstream |= lab.owner.request_set.filter(receipt__program=program)
            
            return program_downstream.exclude(pk__in=actionable_pks)

        
        elif IsLabLead().has_permission(self.request):
            # For a Request to be "downstream" to a Lab means that the 
            # Request is associated with an expert in # the same Lab.
            #
            # NOTE: Need to reset Expert field after "reassignment" back up to
            # Lab. Otherwise this query is too simple and would catch an old 
            # leftover Expert assignment.

            lab = None
            try:
                lab = Lab.objects.get(pk=context.get("instance"))
            except Lab.DoesNotExist:
                return queryset.none()

            return lab.owner.request_set.exclude(expert=None)
        
        # Here just to be explicit.
        elif IsExpert().has_permission(self.request):
            return queryset.none()

        else:
            return queryset.none()


    def get_queryset(self):
        queryset = Request.objects.all()

        # admins can see all requests
        if IsAdmin().has_permission(self.request):
            return queryset

        maybe_context = self.request.headers.get("Context")
        if maybe_context is None:
            return queryset.none()
            
        context = json.loads(maybe_context)

        if not context:
            return queryset.none()

        # user is trying to impersonate another user
        if not (context.get("user") == self.request.user.id): 
            return queryset.none()

        user = User.objects.get(pk=self.request.user.id)

        requests = queryset.none()

        reception_assignments = ReceptionRoleAssignment.objects.filter(user=user)
        program_assignments = ProgramRoleAssignment.objects.filter(user=user)
        lab_assignments = LabRoleAssignment.objects.filter(user=user)

        visible_requests = queryset.none() 

        if  IsCoordinator().has_permission(self.request, self):
            COORDINATOR_ROLE = Role.objects.get(name=ROLE.COORDINATOR)

            coordinator_assignments = reception_assignments.filter(role=COORDINATOR_ROLE)
            for assignment in coordinator_assignments:
                    requests = requests.union(assignment.instance.owner.request_set.all())

        elif IsProgramLead().has_permission(self.request, self):
            PROGRAM_LEAD_ROLE = Role.objects.get(name=ROLE.PROGRAM_LEAD)

            program_lead_assignments = program_assignments.filter(role=PROGRAM_LEAD_ROLE)
            for assignment in program_lead_assignments:
                    requests = requests.union(assignment.instance.owner.request_set.all())

        elif IsLabLead().has_permission(self.request, self):
            LAB_LEAD_ROLE = Role.objects.get(name=ROLE.LAB_LEAD)

            lab_lead_assignments = lab_assignments.filter(role=LAB_LEAD_ROLE)
            for assignment in lab_lead_assignments:
                    requests = requests.union(assignment.instance.owner.request_set.all())
            
            # Requests owned by the Lab that have an "assigned" Expert are not 
            # considered are considered "downstream", not "actionable".
            requests = requests.filter(expert=None)

        elif IsExpert().has_permission(self.request, self):
            EXPERT_ROLE = Role.objects.get(name=ROLE.EXPERT)
      
            expert_assignments = lab_assignments.filter(role=EXPERT_ROLE)
            print(expert_assignments)
            for assignment in expert_assignments:
                    requests = requests.union(assignment.instance.owner.request_set.all())

        return requests 

class RequestDetailView(BaseUserAwareRequest):
    def get(self, request, format=None, id=None):
        queryset= self.get_actionable() | self.get_downstream()

        if id is None:
            return Response(data={"message": "Please provide a Request ID"}, status=status.HTTP_400_BAD_REQUEST)

        found_request = None
        try:
            found_request = queryset.get(pk=id)        
        except:
            return Response(data={"message": "Request with given ID does not exist"}, status=status.HTTP_404_NOT_FOUND)

        customers = found_request.customers 
        customer_serializer = CustomerSerializer(customers, many=True)
        customers_response_data = customer_serializer.data
        for customer in customers_response_data:
            try:
                customer_type = CustomerRequestRelationship.objects.get(request=found_request, customer=Customer.objects.get(pk=customer["id"])).customer_type
                customer_type_data = CustomerTypeSerializer(customer_type).data
                customer["type"] = customer_type_data

            except CustomerRequestRelationship.DoesNotExist:
                return Response(data={"message": "Customer relationship data is missing!"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
            if not(IsAdmin().has_permission(request, None) or IsProgramLead().has_permission(request, None) or IsLabLead().has_permission(request, None) or IsExpert().has_permission(request, None)):
                return Response(data={"message": "Insufficient privillege to update 'expert' field"}, status=status.HTTP_401_UNAUTHORIZED)

            patch_data["proj_start_date"] = body.get("proj_start_date")

        if "proj_completion_date" in body:
            if not(IsAdmin().has_permission(request, None) or IsProgramLead().has_permission(request, None) or IsLabLead().has_permission(request, None) or IsExpert().has_permission(request, None)):
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
    
    def get(self, request, format=None):
        actionable = self.get_actionable()
        downstream = self.get_downstream()
        
        response_data = {"actionable": list(), "downstream": list()}

        for tag in response_data:
            queryset = None 
            if tag == "actionable":
                queryset = actionable
            else:
                queryset = downstream
            
            if not queryset.exists():
                continue 
                
            serializer = RequestListSerializer(queryset, many=True)
            requests_data = list() 
            for request in serializer.data:
                data = request
                poc_customer = Request.objects.get(pk=request["id"]).customerrequestrelationship_set.filter(customer_type=CustomerType.objects.get(name="Primary Contact")).first().customer
                data["customer_name"] = poc_customer.name 
                data["customer_email"] = poc_customer.email 
                requests_data.append(data)
            
            response_data[tag] = requests_data

        return Response(data=response_data, status=status.HTTP_200_OK)
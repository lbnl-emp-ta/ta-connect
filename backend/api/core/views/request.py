from django.db import transaction, IntegrityError

from rest_framework import views, status, permissions, authentication
from rest_framework.response import Response

from django.utils import timezone

from core.utils import create_audit_history, get_status
from core.serializers import * 
from core.models import * 
from core.models.audit_history import ActionType
from core.permissions import *
from core.constants import ROLE, REQUEST_STATUS

from allauth.headless.contrib.rest_framework.authentication import (
    XSessionTokenAuthentication,
)


class ContextError(Exception):
    """Raised when the Context header is missing, unparseable, or contains a mismatched user."""
    pass


"""
Provides common functionality across all Request views. Like
differentiating between requests that are actionable vs.
downstream vs. not visable.
"""
class BaseUserAwareRequest(views.APIView):
    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def get_context(self):
        """
        Returns the parsed & validated Context header dict.
        Raises ContextError if the header is missing, invalid JSON, or
        the embedded user ID doesn't match the authenticated user.
        """
        maybe_context = self.request.headers.get("Context")
        if not maybe_context:
            raise ContextError("Missing Context header")
        context = json.loads(maybe_context)
        if not context:
            raise ContextError("Empty Context header")
        if context.get("user") != self.request.user.id:
            raise ContextError("Context user does not match authenticated user")
        return context

    def get_request_or_error(self, queryset, request_id):
        """
        Returns (instance, None) when found, or (None, Response) on failure.

        Usage::

            found, err = self.get_request_or_error(queryset, request_id)
            if err:
                return err
        """
        try:
            return queryset.get(pk=request_id), None
        except Request.DoesNotExist:
            return None, Response(
                data={"message": "Request with given ID does not exist"},
                status=status.HTTP_404_NOT_FOUND,
            )

    def get_actionable(self):
        if hasattr(self, '_actionable_cache'):
            return self._actionable_cache
    
        queryset = Request.objects.exclude(owner=None)

        # Admins can act on all active requests; bypass context validation.
        if IsAdmin().has_permission(self.request):
            return queryset

        try:
            context = self.get_context()
        except ContextError:
            return queryset.none()

        user = User.objects.get(pk=self.request.user.id)

        requests = queryset.none()

        reception_assignments = ReceptionRoleAssignment.objects.filter(user=user)
        program_assignments = ProgramRoleAssignment.objects.filter(user=user)
        lab_assignments = LabRoleAssignment.objects.filter(user=user)

        if  IsCoordinator().has_permission(self.request, self):
            COORDINATOR_ROLE = Role.objects.get(name=ROLE.COORDINATOR)

            coordinator_assignments = reception_assignments.filter(role=COORDINATOR_ROLE)
            for assignment in coordinator_assignments:
                    requests = requests.union(assignment.instance.owner.request_set.all())

        elif IsProgramLead().has_permission(self.request, self):
            PROGRAM_LEAD_ROLE = Role.objects.get(name=ROLE.PROGRAM_LEAD)

            program = None
            try:
                program = Program.objects.get(pk=context.get("instance"))
            except Program.DoesNotExist:
                return queryset.none()

            program_lead_assignments = program_assignments.filter(role=PROGRAM_LEAD_ROLE, instance=program)
            for assignment in program_lead_assignments:
                    requests = requests.union(assignment.instance.owner.request_set.all())

        elif IsLabLead().has_permission(self.request, self):
            LAB_LEAD_ROLE = Role.objects.get(name=ROLE.LAB_LEAD)

            lab = None
            try:
                lab = Lab.objects.get(pk=context.get("instance"))
            except Lab.DoesNotExist:
                return queryset.none()

            lab_lead_assignments = lab_assignments.filter(role=LAB_LEAD_ROLE, instance=lab)
            for assignment in lab_lead_assignments:
                # NOTE: Should lab leads be able to see all requests for their lab, or just ones for their lab+program?
                requests = requests.union(queryset.filter(owner=lab.owner))

        elif IsExpert().has_permission(self.request, self):
            # NOTE: Should experts be able to see all requests for their lab, or just ones for their lab+program?
            requests = requests.union(queryset.filter(owner=user.owner))

        requests = Request.objects.filter(id__in=requests.values('id'))
        self._actionable_cache = requests
        return requests
    
    def get_downstream(self):
        queryset = Request.objects.exclude(owner=None)

        # Admins have no downstream requests by convention.
        if IsAdmin().has_permission(self.request):
            return queryset.none()

        try:
            context = self.get_context()
        except ContextError:
            return queryset.none()

        actionable_pks = self.get_actionable().values('pk')

        # All requests that are in the system, excluding ones that have been 
        # archived (i.e. no owner) or are owned by Reception currently 
        # (i.e. are actionable).
        if IsCoordinator().has_permission(self.request):
            return queryset.exclude(pk__in=actionable_pks)

        elif IsProgramLead().has_permission(self.request):
            program = None
            try:
                program = Program.objects.get(pk=context.get("instance"))
            except Program.DoesNotExist:
                return queryset.none()
            
            return queryset.filter(program=program).exclude(pk__in=actionable_pks)

        
        elif IsLabLead().has_permission(self.request):
            # Downstream for a LabLead means requests associated with this lab
            # but not currently in the lab's queue — either owned by an expert
            # (being actively worked) or back up at the program (awaiting final approval) or completed.
            lab = None
            try:
                lab = Lab.objects.get(pk=context.get("instance"))
            except Lab.DoesNotExist:
                return queryset.none()

            return queryset.filter(lab=lab).exclude(owner=lab.owner).exclude(pk__in=actionable_pks)
        
        elif IsExpert().has_permission(self.request):
            # Downstream for an Expert means requests assigned to them but not currently in their queue.
            # Either owned by the lab (awaiting approval) or back up at the program (awaiting final approval) or completed.
            user = User.objects.get(pk=context.get("user"))
            return queryset.filter(expert=user).exclude(owner=user.owner)
        else:
            return queryset.none()
        
    def get_inactive(self):
        try:
            context = self.get_context()
        except ContextError:
            return Request.objects.none()

        queryset = Request.objects.filter(owner=None)

        if IsAdmin().has_permission(self.request):
            return queryset
        elif IsCoordinator().has_permission(self.request, self):
            return queryset
        elif IsProgramLead().has_permission(self.request, self):
            program = None
            try:
                program = Program.objects.get(pk=context.get("instance"))
            except Program.DoesNotExist:
                return queryset.none()
            
            return queryset.filter(program=program)
        elif IsLabLead().has_permission(self.request, self):
            lab = None
            try:
                lab = Lab.objects.get(pk=context.get("instance"))
            except Lab.DoesNotExist:
                return queryset.none()

            return queryset.filter(lab=lab)
        elif IsExpert().has_permission(self.request, self):
            user = User.objects.get(pk=context.get("user"))
            return queryset.filter(expert=user)

        return queryset.none()


class RequestDetailView(BaseUserAwareRequest):
    serializer_class = RequestDetailSerializer

    """
    Used to populate Request and Customer panels.
    """
    def get(self, request, format=None, request_id=None):
        queryset = self.get_actionable() | self.get_downstream() | self.get_inactive()

        if request_id is None:
            return Response(data={"message": "Please provide a Request ID"}, status=status.HTTP_400_BAD_REQUEST)

        found_request, err = self.get_request_or_error(queryset, request_id)
        if err:
            return err

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

        request_serializer = self.serializer_class(found_request)

        response_data = dict(request_serializer.data)
        response_data["customers"] = customer_serializer.data
        response_data["owner"] = OwnerSerializer().format_owner(found_request.owner)

        # Determine depth options based on request's current program.
        # Only Program Leads, Lab Leads, Coordinators, and Admins should be able to see depth options,
        # and only if a program is currently assigned to the request.
        depth_options = []
        if found_request.program and CanEditDepth().has_permission(request):
            program = found_request.program
            depth_options = list(program.depths.values_list('name', flat=True))
        
        response_data["depth_options"] = depth_options

        response_data["attachments"] = list() 
        for attachment in found_request.attachment_set.all():
            attachment_data = dict()
            attachment_data["id"] = attachment.pk
            attachment_data["title"] = attachment.title
            attachment_data["uploaded_at"] = attachment.uploaded_at
            attachment_data["description"] = attachment.description
            response_data["attachments"].append(attachment_data)

        response_data["audit_history"] = list() 
        for audit in found_request.audithistory_set.all().order_by('-date'):
            audit_data = dict()
            audit_data["user"] = audit.user.name
            audit_data["role"] = audit.role.name
            audit_data["action_type"] = audit.action_type
            audit_data["description"] = audit.description
            audit_data["date"] = audit.date
            response_data["audit_history"].append(audit_data)

        # if found_request.expert is not None:
        #     response_data["expert"] = UserLeanSerializer(found_request.expert).data

        return Response(data=response_data, status=status.HTTP_200_OK)

    """
    Used for Edit action.
    """
    def patch(self, request, request_id=None):
        if request_id is None:
            return Response(data={"message": "Please provide a Request ID"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            context = self.get_context()
        except ContextError:
            return Response(data={"message": "Please provide context object header with request"}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = self.get_actionable() | self.get_downstream()

        maybe_request, err = self.get_request_or_error(queryset, request_id)
        if err:
            return err

        body = request.data

        patch_data = dict()

        if not body:
            return Response(data={"message": "Missing request body"}, status=status.HTTP_204_NO_CONTENT)
        
        if "description" in body:
            if not CanEditDescription().has_permission(request):
                return Response(data={"message": "Insufficient privillege to update 'description' field"}, status=status.HTTP_401_UNAUTHORIZED)
            
            new_description_data = body.get("description")
            if new_description_data is None:
                new_description_data = ""

            patch_data["description"] = new_description_data 

        if "depth" in body:
            if not CanEditDepth().has_permission(request):
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
            if not (IsAnyRoleOnRequest().has_permission(request)):
                return Response(data={"message": "Insufficient privillege to update 'actual completion date' field"}, status=status.HTTP_401_UNAUTHORIZED)

            patch_data["actual_completion_date"] = body.get("actual_completion_date") 

        if "expert" in body:
            if not(IsAdmin().has_permission(request) or IsLabLead().has_permission(request)):
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
                    if IsLabLead().has_permission(request):
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
            if not(IsAnyRoleOnRequest().has_permission(request)):
                return Response(data={"message": "Insufficient privillege to update 'projected start date' field"}, status=status.HTTP_401_UNAUTHORIZED)

            patch_data["proj_start_date"] = body.get("proj_start_date")

        if "proj_completion_date" in body:
            if not(IsAnyRoleOnRequest().has_permission(request)):
                return Response(data={"message": "Insufficient privillege to update 'projected completion date' field"}, status=status.HTTP_401_UNAUTHORIZED)

            # Projected completion date can only be set if request is currently ASSIGNED_TO_EXPERT
            # or is already PROVIDING_TA (in which case we're just updating the projected completion date).
            # Setting it implies status should be updated to PROVIDING_TA.
            if maybe_request.status.name in [REQUEST_STATUS.ASSIGNED_TO_EXPERT, REQUEST_STATUS.PROVIDING_TA]:
                patch_data["proj_completion_date"] = body.get("proj_completion_date")
                patch_data["status"] = get_status(REQUEST_STATUS.PROVIDING_TA)
            # If projected completion date is being removed while PROVIDING_TA, revert status back to ASSIGNED_TO_EXPERT
            if body.get("proj_completion_date") == None and maybe_request.status.name == REQUEST_STATUS.PROVIDING_TA:
                patch_data["status"] = get_status(REQUEST_STATUS.ASSIGNED_TO_EXPERT)
            
        if "status" in body:
            if body.get("status") is None:
                return Response(data={"message": "Cannot clear status field on request. Need to provide value replacement value."}, status=status.HTTP_400_BAD_REQUEST)

            maybe_status = None
            try:
                maybe_status = RequestStatus.objects.get(pk=body.get("status"))
            except RequestStatus.DoesNotExist:
                return Response(data={"message": "Provided status does not exist."}, status=status.HTTP_400_BAD_REQUEST)

            patch_data["status"] = maybe_status.name 
        
        # Topics are done a special way (not using patch serializer) because they are 
        # stored as a Many-to-Many relationship in the database.
        if "topics" in body:
            if not CanEditTopics().has_permission(request):
                return Response(data={"message": "Insufficient privillege to update 'topics' field"}, status=status.HTTP_401_UNAUTHORIZED)
            current_topics = maybe_request.topics.all()
            maybe_request.topics.clear()
            
            topics = body.get("topics", list())
            for topic_name in topics:
                try:
                    topic = Topic.objects.get(name=topic_name)
                except Topic.DoesNotExist:
                    maybe_request.topics.set(current_topics)
                    return Response(data={"message": "One of the provided topics does not exist."}, status=status.HTTP_400_BAD_REQUEST)

                maybe_request.topics.add(topic)
                
        
       # do partial save with accumulated patch 
        patch_serializer = RequestSerializer(instance=maybe_request, data=patch_data, partial=True)
        if(patch_serializer.is_valid()):
            try:
                patch_serializer.save()
            except IntegrityError as e:
                error_msg = str(e)
                for constraint in Request._meta.constraints:
                    if constraint.name in error_msg:
                        error_msg = constraint.violation_error_message
                        break
                return Response(data={"message": error_msg}, status=status.HTTP_400_BAD_REQUEST)
            create_audit_history(request, maybe_request, ActionType.EditRequestDetails, f"Edited request: {str(patch_data)[:20]}...")
        else:
            return Response(data={"message": patch_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


        return self.get(request, None, request_id)


"""
Used to populate the request table. 
"""
class RequestListView(BaseUserAwareRequest):
    def get(self, request, format=None):
        actionable = self.get_actionable()
        downstream = self.get_downstream()
        inactive = self.get_inactive()
        
        response_data = {"actionable": list(), "downstream": list(), "inactive": list()}

        for key in response_data:
            queryset = None 
            if key == "actionable":
                queryset = actionable
            elif key == "downstream":
                queryset = downstream
            elif key == "inactive":
                queryset = inactive
            
            if not queryset or not queryset.exists():
                continue 
                
            serializer = RequestListSerializer(queryset, many=True)
            requests_data = list() 
            for request in serializer.data:
                data = request
                poc_customer = Request.objects.get(pk=request["id"]).customerrequestrelationship_set.filter(customer_type=CustomerType.objects.get(name="Primary Contact")).first().customer
                data["customer_name"] = poc_customer.name 
                data["customer_email"] = poc_customer.email 
                data["customer_state_abbreviation"] = poc_customer.state.abbreviation 
                requests_data.append(data)
            
            response_data[key] = requests_data

        return Response(data=response_data, status=status.HTTP_200_OK)

class RequestMarkCompleteView(BaseUserAwareRequest):
    permission_classes = [permissions.IsAuthenticated, CanMarkComplete]

    def post(self, request, request_id=None):
        queryset = self.get_actionable()
        found_request, err = self.get_request_or_error(queryset, request_id)
        if err:
            return err

        # Maybe consider checking program/lab/expert to see if its even been serviced?
        try:
            found_request.status = RequestStatus.objects.get(name=REQUEST_STATUS.COMPLETED)
            found_request.owner = None
            found_request.save()
            create_audit_history(request, found_request, ActionType.StatusChange, f"Status changed to Completed")
            create_audit_history(request, found_request, ActionType.Assignment, f"Removed all assignments")
        except Exception as e:
            return Response(data={"message": f"{e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(status=status.HTTP_200_OK)
      
class RequestCancelView(BaseUserAwareRequest):
    permission_classes = [permissions.IsAuthenticated, CanCancel]

    def post(self, request, request_id=None):
        queryset = self.get_actionable()
        found_request, err = self.get_request_or_error(queryset, request_id)
        if err:
            return err

        try:
            with transaction.atomic():
                found_request.status = RequestStatus.objects.get(name=REQUEST_STATUS.UNABLE_TO_ADDRESS)
                found_request.owner = None
                found_request.expert = None

                found_request.program = None
                found_request.lab = None
                found_request.expert = None

                found_request.save()
                create_audit_history(request, found_request, ActionType.StatusChange, f"Status changed to Unable to Address")
                create_audit_history(request, found_request, ActionType.Assignment, f"Removed all assignments")

        except Exception as e:
            return Response(data={"message": f"{e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(status=status.HTTP_200_OK)

class RequestSubmitCloseoutFormView(BaseUserAwareRequest):
    permission_classes = [permissions.IsAuthenticated, CanSubmitCloseout]

    def post(self, request, request_id=None):
        queryset = self.get_actionable()
        found_request, err = self.get_request_or_error(queryset, request_id)
        if err:
            return err

        # Experts must be the assigned expert on this specific request
        if IsExpert().has_permission(request) and not IsAdmin().has_permission(request):
            if found_request.expert is None or found_request.expert != request.user:
                return Response(data={"message": "Only the assigned expert can submit the closeout form"}, status=status.HTTP_403_FORBIDDEN)

        if not hasattr(found_request, "closeout_form"):
            return Response(data={"message": "Closeout form does not exist for this request"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                closeout_form = found_request.closeout_form
                closeout_form.submitted_date = timezone.now()
                closeout_form.save()

                found_request.status = get_status(REQUEST_STATUS.CLOSEOUT_REVIEW_BY_LAB)
                found_request.owner = found_request.lab.owner if found_request.lab else None
                found_request.save()

                create_audit_history(request, found_request, ActionType.StatusChange, "Closeout form submitted, status changed to Closeout Review by Lab")
        except Exception as e:
            return Response(data={"message": f"{e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(status=status.HTTP_200_OK)


class RequestApproveCloseoutFormByLabView(BaseUserAwareRequest):
    permission_classes = [permissions.IsAuthenticated, CanApproveCloseoutByLab]

    def post(self, request, request_id=None):
        queryset = self.get_actionable()
        found_request, err = self.get_request_or_error(queryset, request_id)
        if err:
            return err

        if not hasattr(found_request, "closeout_form"):
            return Response(data={"message": "Closeout form does not exist for this request"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                closeout_form = found_request.closeout_form
                closeout_form.approved_by_lab = True
                closeout_form.save()

                found_request.status = get_status(REQUEST_STATUS.CLOSEOUT_REVIEW_BY_PROGRAM)
                found_request.owner = found_request.program.owner if found_request.program else None
                found_request.save()

                create_audit_history(request, found_request, ActionType.StatusChange, "Closeout form approved by lab, status changed to Closeout Review by Program")
        except Exception as e:
            return Response(data={"message": f"{e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(status=status.HTTP_200_OK)


class RequestApproveCloseoutFormByProgramView(BaseUserAwareRequest):
    permission_classes = [permissions.IsAuthenticated, CanApproveCloseoutByProgram]

    def post(self, request, request_id=None):
        queryset = self.get_actionable()
        found_request, err = self.get_request_or_error(queryset, request_id)
        if err:
            return err

        if not hasattr(found_request, "closeout_form"):
            return Response(data={"message": "Closeout form does not exist for this request"}, status=status.HTTP_400_BAD_REQUEST)

        if not found_request.closeout_form.approved_by_lab:
            return Response(data={"message": "Closeout form must be approved by lab before program can approve"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                closeout_form = found_request.closeout_form
                closeout_form.approved_by_program = True
                closeout_form.save()

                found_request.status = get_status(REQUEST_STATUS.COMPLETED)
                found_request.owner = None
                found_request.save()

                create_audit_history(request, found_request, ActionType.StatusChange, "Closeout form approved by program, status changed to Completed")
        except Exception as e:
            return Response(data={"message": f"{e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(status=status.HTTP_200_OK)


class RequestReopenView(BaseUserAwareRequest):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def post(self, request, request_id=None):
        queryset = Request.objects.filter(owner=None)
        found_request, err = self.get_request_or_error(queryset, request_id)
        if err:
            return err

        try:
            found_request.status = RequestStatus.objects.get(name=REQUEST_STATUS.SCOPING)
            found_request.owner = Owner.objects.get(pk=Owner.get_default_pk())
            found_request.save()
            create_audit_history(request, found_request, ActionType.StatusChange, f"Request reopened, status changed to Scoping")
            create_audit_history(request, found_request, ActionType.Assignment, f"Assigned to Reception")

        except Exception as e:
            return Response(data={"message": f"{e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(status=status.HTTP_200_OK)

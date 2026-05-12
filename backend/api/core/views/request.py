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
downstream vs. not visible.
"""
class BaseUserAwareRequest(views.APIView):
    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
    ]

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
                data={"message": "Request with given ID does not exist or is not visible to this user."},
                status=status.HTTP_404_NOT_FOUND,
            )

    def get_actionable(self):
        """
        Returns requests that the user can currently act on (i.e. ones they own).
        """
        if hasattr(self, '_actionable_cache'):
            return self._actionable_cache
    
        queryset = Request.objects.exclude(owner=None)

        # Admins can act on all active requests
        if IsAdmin().has_permission(self.request):
            return queryset.distinct()

        actionable_requests = queryset.none()
        user = User.objects.get(pk=self.request.user.id)
        reception_assignments = ReceptionRoleAssignment.objects.filter(user=user)
        program_assignments = ProgramRoleAssignment.objects.filter(user=user)
        lab_assignments = LabRoleAssignment.objects.filter(user=user)

        for assignment in reception_assignments:
            actionable_requests = actionable_requests | assignment.instance.owner.request_set.all()

        for assignment in program_assignments:
            actionable_requests = actionable_requests | assignment.instance.owner.request_set.all()

        for assignment in lab_assignments:
            actionable_requests = actionable_requests | assignment.instance.owner.request_set.all()

        actionable_requests = actionable_requests.distinct()
        self._actionable_cache = actionable_requests
        return actionable_requests
    
    def get_downstream(self):
        """
        Returns requests that the user has visibility into but cannot currently act on
        (i.e. ones they have owned at some point in the process).
        """
        queryset = Request.objects.exclude(owner=None)

        # Admins have no downstream requests by convention.
        if IsAdmin().has_permission(self.request):
            return queryset.none()

        actionable_pks = self.get_actionable().values('pk')

        # Coordinators' downstream requests include all that are owned,
        # except for those that are currently owned/actionable by Reception.
        if IsCoordinator().has_permission(self.request):
            return queryset.exclude(pk__in=actionable_pks).distinct()

        downstream_requests = queryset.none()
        user = User.objects.get(pk=self.request.user.id)
        program_assignments = ProgramRoleAssignment.objects.filter(user=user)
        lab_assignments = LabRoleAssignment.objects.filter(user=user)

        for assignment in program_assignments:
            program = assignment.instance
            downstream_requests = downstream_requests | queryset.filter(program=program).exclude(pk__in=actionable_pks)

        for assignment in lab_assignments:
            lab = assignment.instance
            if assignment.role.name == ROLE.LAB_LEAD:
                downstream_requests = downstream_requests | queryset.filter(lab=lab).exclude(pk__in=actionable_pks)
            elif assignment.role.name == ROLE.EXPERT:
                downstream_requests = downstream_requests | queryset.filter(lab=lab, expert=user).exclude(pk__in=actionable_pks)
        
        return downstream_requests.distinct()
        
    def get_inactive(self):
        """
        Returns requests that are unowned (Completed or Unable to Address) and
        are associated with one of the user's role assignments.
        """
        queryset = Request.objects.filter(owner=None)

        # Admins and coordinators can see all inactive requests by convention.
        if IsAdmin().has_permission(self.request) or IsCoordinator().has_permission(self.request, self):
            return queryset.distinct()
        
        inactive_requests = queryset.none()
        user = User.objects.get(pk=self.request.user.id)
        program_assignments = ProgramRoleAssignment.objects.filter(user=user)
        lab_assignments = LabRoleAssignment.objects.filter(user=user)

        for assignment in program_assignments:
            program = assignment.instance
            inactive_requests = inactive_requests | queryset.filter(program=program)

        for assignment in lab_assignments:
            lab = assignment.instance
            if assignment.role.name == ROLE.LAB_LEAD:
                inactive_requests = inactive_requests | queryset.filter(lab=lab)
            elif assignment.role.name == ROLE.EXPERT:
                inactive_requests = inactive_requests | queryset.filter(lab=lab, expert=user)

        return inactive_requests.distinct()


class RequestDetailView(BaseUserAwareRequest):
    serializer_class = RequestDetailSerializer

    def get(self, request, format=None, request_id=None):
        """
        Used to populate Request and Customer panels.
        """
        queryset = self.get_actionable() | self.get_downstream() | self.get_inactive()

        if request_id is None:
            return Response(data={"message": "Please provide a Request ID"}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure the request is visible to the user
        ta_request, err = self.get_request_or_error(queryset, request_id)
        if err:
            return err

        customers = ta_request.customers 
        customer_serializer = CustomerSerializer(customers, many=True)
        customers_response_data = customer_serializer.data
        for customer in customers_response_data:
            try:
                customer_type = CustomerRequestRelationship.objects.get(request=ta_request, customer=Customer.objects.get(pk=customer["id"])).customer_type
                customer_type_data = CustomerTypeSerializer(customer_type).data
                customer["type"] = customer_type_data

            except CustomerRequestRelationship.DoesNotExist:
                return Response(data={"message": "Customer relationship data is missing!"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        request_serializer = self.serializer_class(ta_request)

        response_data = dict(request_serializer.data)
        response_data["customers"] = customer_serializer.data
        response_data["owner"] = OwnerSerializer().format_owner(ta_request.owner)

        # Determine depth options based on request's current program.
        # Only Program Leads, Lab Leads, Coordinators, and Admins should be able to see depth options,
        # and only if a program is currently assigned to the request.
        depth_options = []
        if ta_request.program and CanEditDepth().has_object_permission(request, self, ta_request):
            program = ta_request.program
            depth_options = list(program.depths.values_list('name', flat=True))
        
        response_data["depth_options"] = depth_options

        response_data["attachments"] = list() 
        for attachment in ta_request.attachment_set.all():
            attachment_data = dict()
            attachment_data["id"] = attachment.pk
            attachment_data["title"] = attachment.title
            attachment_data["uploaded_at"] = attachment.uploaded_at
            attachment_data["description"] = attachment.description
            response_data["attachments"].append(attachment_data)

        response_data["audit_history"] = list() 
        for audit in ta_request.audithistory_set.all().order_by('-date'):
            audit_data = dict()
            audit_data["user"] = audit.user.name
            audit_data["role"] = audit.role.name
            audit_data["action_type"] = audit.action_type
            audit_data["description"] = audit.description
            audit_data["date"] = audit.date
            response_data["audit_history"].append(audit_data)

        return Response(data=response_data, status=status.HTTP_200_OK)

    """
    Used for Edit action.
    """
    def patch(self, request, request_id=None):
        if request_id is None:
            return Response(data={"message": "Please provide a Request ID"}, status=status.HTTP_400_BAD_REQUEST)

        # try:
        #     context = self.get_context()
        # except ContextError:
        #     return Response(data={"message": "Please provide context object header with request"}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = self.get_actionable() | self.get_downstream()

        ta_request, err = self.get_request_or_error(queryset, request_id)
        if err:
            return err

        body = request.data

        patch_data = dict()
        updated_fields = list()

        if not body:
            return Response(data={"message": "Missing request body"}, status=status.HTTP_204_NO_CONTENT)
        
        if "description" in body:
            if not CanEditDescription().has_object_permission(request, self, ta_request):
                return Response(data={"message": "Insufficient privillege to update 'description' field"}, status=status.HTTP_401_UNAUTHORIZED)
            
            new_description_data = body.get("description")
            if new_description_data is None:
                new_description_data = ""

            patch_data["description"] = new_description_data 
            updated_fields.append("description")

        if "challenges" in body:
            if not CanEditDescription().has_object_permission(request, self, ta_request):
                return Response(data={"message": "Insufficient privillege to update 'challenges' field"}, status=status.HTTP_401_UNAUTHORIZED)
            
            new_challenges_data = body.get("challenges")

            patch_data["challenges"] = new_challenges_data 
            updated_fields.append("challenges")

        if "goals" in body:
            if not CanEditDescription().has_object_permission(request, self, ta_request):
                return Response(data={"message": "Insufficient privillege to update 'goals' field"}, status=status.HTTP_401_UNAUTHORIZED)
            
            new_goals_data = body.get("goals")

            patch_data["goals"] = new_goals_data
            updated_fields.append("goals")

        if "effort" in body:
            if not CanEditDescription().has_object_permission(request, self, ta_request):
                return Response(data={"message": "Insufficient privillege to update 'effort' field"}, status=status.HTTP_401_UNAUTHORIZED)
            
            new_effort_data = body.get("effort")

            patch_data["effort"] = new_effort_data
            updated_fields.append("effort")

        if "depth" in body:
            if not CanEditDepth().has_object_permission(request, self, ta_request):
                return Response(data={"message": "Insufficient privillege to update 'depth' field"}, status=status.HTTP_401_UNAUTHORIZED)
            
            if body.get("depth") is None:
                return Response(data={"message": "Cannot clear depth field on a request. Need to provide a valid replacement value."}, status=status.HTTP_401_UNAUTHORIZED)
            
            maybe_depth = None
            try:
                maybe_depth = Depth.objects.get(name=body.get("depth"))
            except Depth.DoesNotExist:
                return Response(data={"message": "Provided depth does not exist."}, status=status.HTTP_400_BAD_REQUEST)

            patch_data["depth"] = maybe_depth.name
            updated_fields.append("depth")

        if "actual_completion_date" in body:
            if not (IsAnyRoleOnRequest().has_object_permission(request, self, ta_request)):
                return Response(data={"message": "Insufficient privillege to update 'actual completion date' field"}, status=status.HTTP_401_UNAUTHORIZED)

            patch_data["actual_completion_date"] = body.get("actual_completion_date")
            updated_fields.append("actual completion date")
        
        if "proj_start_date" in body:
            if not(IsAnyRoleOnRequest().has_object_permission(request, self, ta_request)):
                return Response(data={"message": "Insufficient privillege to update 'projected start date' field"}, status=status.HTTP_401_UNAUTHORIZED)

            patch_data["proj_start_date"] = body.get("proj_start_date")
            updated_fields.append("projected start date")

        if "proj_completion_date" in body:
            if not(IsAnyRoleOnRequest().has_object_permission(request, self, ta_request)):
                return Response(data={"message": "Insufficient privillege to update 'projected completion date' field"}, status=status.HTTP_401_UNAUTHORIZED)

            # Projected completion date can only be set if request is currently ASSIGNED_TO_EXPERT
            # or is already PROVIDING_TA (in which case we're just updating the projected completion date).
            # Setting it implies status should be updated to PROVIDING_TA.
            if ta_request.status.name in [REQUEST_STATUS.ASSIGNED_TO_EXPERT, REQUEST_STATUS.PROVIDING_TA]:
                patch_data["proj_completion_date"] = body.get("proj_completion_date")
                patch_data["status"] = get_status(REQUEST_STATUS.PROVIDING_TA)
            # If projected completion date is being removed while PROVIDING_TA, revert status back to ASSIGNED_TO_EXPERT
            if body.get("proj_completion_date") == None and ta_request.status.name == REQUEST_STATUS.PROVIDING_TA:
                patch_data["status"] = get_status(REQUEST_STATUS.ASSIGNED_TO_EXPERT)

            updated_fields.append("projected completion date")
            updated_fields.append("status")
            
        if "status" in body:
            if body.get("status") is None:
                return Response(data={"message": "Cannot clear status field on request. Need to provide replacement value."}, status=status.HTTP_400_BAD_REQUEST)

            maybe_status = None
            try:
                maybe_status = RequestStatus.objects.get(pk=body.get("status"))
            except RequestStatus.DoesNotExist:
                return Response(data={"message": "Provided status does not exist."}, status=status.HTTP_400_BAD_REQUEST)

            patch_data["status"] = maybe_status.name
            updated_fields.append("status")
        
        # Topics are done a special way (not using patch serializer) because they are 
        # stored as a Many-to-Many relationship in the database.
        if "topics" in body:
            if not CanEditTopics().has_object_permission(request, self, ta_request):
                return Response(data={"message": "Insufficient privillege to update 'topics' field"}, status=status.HTTP_401_UNAUTHORIZED)
            current_topics = ta_request.topics.all()
            ta_request.topics.clear()
            
            topics = body.get("topics", list())
            for topic_name in topics:
                try:
                    topic = Topic.objects.get(name=topic_name)
                except Topic.DoesNotExist:
                    ta_request.topics.set(current_topics)
                    return Response(data={"message": "One of the provided topics does not exist."}, status=status.HTTP_400_BAD_REQUEST)

                ta_request.topics.add(topic)

            updated_fields.append("topics")
                
        
       # do partial save with accumulated patch 
        patch_serializer = RequestSerializer(instance=ta_request, data=patch_data, partial=True)
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
            create_audit_history(request, ta_request, ActionType.EditRequestDetails, f"Edited: {str(updated_fields)}")
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
      
class RequestCancelView(BaseUserAwareRequest):
    permission_classes = [permissions.IsAuthenticated, CanCancel]

    def post(self, request, request_id=None):
        queryset = self.get_actionable()
        ta_request, err = self.get_request_or_error(queryset, request_id)
        if err:
            return err

        try:
            with transaction.atomic():
                ta_request.status = RequestStatus.objects.get(name=REQUEST_STATUS.UNABLE_TO_ADDRESS)
                ta_request.owner = None
                ta_request.expert = None

                ta_request.program = None
                ta_request.lab = None
                ta_request.expert = None

                ta_request.save()
                create_audit_history(request, ta_request, ActionType.StatusChange, f"Status changed to Unable to Address")
                create_audit_history(request, ta_request, ActionType.Assignment, f"Removed all assignments")

        except Exception as e:
            return Response(data={"message": f"{e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(status=status.HTTP_200_OK)

class RequestSubmitCloseoutFormView(BaseUserAwareRequest):
    permission_classes = [permissions.IsAuthenticated, CanSubmitCloseout]

    def post(self, request, request_id=None):
        queryset = self.get_actionable()
        ta_request, err = self.get_request_or_error(queryset, request_id)
        if err:
            return err

        # Experts must be the assigned expert on this specific request
        if IsExpert().has_object_permission(request, self, ta_request) and not IsAdmin().has_permission(request):
            if ta_request.expert is None or ta_request.expert != request.user:
                return Response(data={"message": "Only the assigned expert can submit the closeout form"}, status=status.HTTP_403_FORBIDDEN)

        if not hasattr(ta_request, "closeout_form"):
            return Response(data={"message": "Closeout form does not exist for this request"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                closeout_form = ta_request.closeout_form
                closeout_form.submitted_date = timezone.now()
                closeout_form.save()

                ta_request.status = get_status(REQUEST_STATUS.CLOSEOUT_REVIEW_BY_LAB)
                ta_request.owner = ta_request.lab.owner if ta_request.lab else None
                ta_request.save()

                create_audit_history(request, ta_request, ActionType.StatusChange, "Closeout form submitted, status changed to Closeout Review by Lab")
        except Exception as e:
            return Response(data={"message": f"{e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(status=status.HTTP_200_OK)


class RequestApproveCloseoutFormByLabView(BaseUserAwareRequest):
    permission_classes = [permissions.IsAuthenticated, CanApproveCloseoutByLab]

    def post(self, request, request_id=None):
        queryset = self.get_actionable()
        ta_request, err = self.get_request_or_error(queryset, request_id)
        if err:
            return err

        if not hasattr(ta_request, "closeout_form"):
            return Response(data={"message": "Closeout form does not exist for this request"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                closeout_form = ta_request.closeout_form
                closeout_form.approved_by_lab = True
                closeout_form.save()

                ta_request.status = get_status(REQUEST_STATUS.CLOSEOUT_REVIEW_BY_PROGRAM)
                ta_request.owner = ta_request.program.owner if ta_request.program else None
                ta_request.save()

                create_audit_history(request, ta_request, ActionType.StatusChange, "Closeout form approved by lab, status changed to Closeout Review by Program")
        except Exception as e:
            return Response(data={"message": f"{e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(status=status.HTTP_200_OK)


class RequestApproveCloseoutFormByProgramView(BaseUserAwareRequest):
    permission_classes = [permissions.IsAuthenticated, CanApproveCloseoutByProgram]

    def post(self, request, request_id=None):
        queryset = self.get_actionable()
        ta_request, err = self.get_request_or_error(queryset, request_id)
        if err:
            return err

        if not hasattr(ta_request, "closeout_form"):
            return Response(data={"message": "Closeout form does not exist for this request"}, status=status.HTTP_400_BAD_REQUEST)

        if not ta_request.closeout_form.approved_by_lab:
            return Response(data={"message": "Closeout form must be approved by lab before program can approve"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                closeout_form = ta_request.closeout_form
                closeout_form.approved_by_program = True
                closeout_form.save()

                ta_request.status = get_status(REQUEST_STATUS.COMPLETED)
                ta_request.owner = None
                ta_request.save()

                create_audit_history(request, ta_request, ActionType.StatusChange, "Closeout form approved by program, status changed to Completed")
        except Exception as e:
            return Response(data={"message": f"{e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(status=status.HTTP_200_OK)


class RequestReopenView(BaseUserAwareRequest):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def post(self, request, request_id=None):
        queryset = Request.objects.filter(owner=None)
        ta_request, err = self.get_request_or_error(queryset, request_id)
        if err:
            return err

        try:
            ta_request.status = RequestStatus.objects.get(name=REQUEST_STATUS.SCOPING)
            ta_request.owner = Owner.objects.get(pk=Owner.get_default_pk())
            ta_request.program = None
            ta_request.lab = None
            ta_request.expert = None
            ta_request.save()
            create_audit_history(request, ta_request, ActionType.StatusChange, f"Request reopened, status changed to Scoping")
            create_audit_history(request, ta_request, ActionType.Assignment, f"Assigned to Reception")

        except Exception as e:
            return Response(data={"message": f"{e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(status=status.HTTP_200_OK)

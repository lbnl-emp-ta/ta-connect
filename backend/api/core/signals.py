from django.db import transaction
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver

from core.models import User, ReceptionRoleAssignment, Role, Request, Owner, ReceptionRoleAssignment, ProgramRoleAssignment, LabRoleAssignment

_UNSET = object()
from core.constants import DOMAINTYPE, ROLE
from core.util.notifications import send_email_notification
from core.util.email_prompts import new_request_email, assignment_email, customer_status_email


def _send_customer_status_emails(request, customers):
    """Send a status update email to each customer in the given list."""
    for customer in customers:
        plain_text_message, html_message = customer_status_email(
            receipient_name=customer.name,
            request=request,
        )
        send_email_notification(
            subject=f"TA Connect - Status Updated for Request #{request.pk}",
            plain_text_message=plain_text_message,
            html_message=html_message,
            recipient_list=[customer.email],
        )


@receiver(pre_save, sender=User)
def sync_allauth_email_on_change(sender, instance, **kwargs):
    """
    When a User's email is changed (from any path — admin, API, shell, etc.),
    keep the corresponding allauth account_emailaddress row in sync.
    Marks the new email as unverified since it hasn't been confirmed yet.
    """
    if not instance.pk:
        # New user — allauth will create the EmailAddress row itself
        return

    try:
        old_email = User.objects.values_list("email", flat=True).get(pk=instance.pk)
    except User.DoesNotExist:
        return

    if old_email == instance.email:
        return

    # Import here to avoid circular imports at module load time
    from allauth.account.models import EmailAddress

    updated = EmailAddress.objects.filter(user_id=instance.pk).update(
        email=instance.email,
        verified=False,
    )

    # If there was no EmailAddress row at all, create one (e.g. social-only accounts)
    if not updated:
        EmailAddress.objects.create(
            user=instance,
            email=instance.email,
            primary=True,
            verified=False,
        )


@receiver(pre_save, sender="core.Request")
def snapshot_request_assignment_fields(sender, instance, **kwargs):
    """
    Before saving a Request, snapshot the current status, owner_id, and expert_id so
    post_save handlers can detect whether those fields actually changed.
    """
    if not instance.pk:
        instance._pre_save_status = _UNSET
        instance._pre_save_owner_id = _UNSET
        instance._pre_save_expert_id = _UNSET
        return

    try:
        old = Request.objects.values("status", "owner_id", "expert_id").get(pk=instance.pk)
        instance._pre_save_status = old["status"]
        instance._pre_save_owner_id = old["owner_id"]
        instance._pre_save_expert_id = old["expert_id"]
    except Request.DoesNotExist:
        instance._pre_save_status = _UNSET
        instance._pre_save_owner_id = _UNSET
        instance._pre_save_expert_id = _UNSET


@receiver(post_save, sender="core.Request")
def notify_reception_on_new_request(sender, instance, created, **kwargs):
    """
    After a new Request is saved for the first time, email all Reception
    Coordinators so they know a request is awaiting review.

    Deferred via transaction.on_commit so the CustomerRequestRelationship
    is available when we try to send the email.
    """
    if not created:
        return

    def send_notifications():
        coordinator_role = Role.objects.filter(name=ROLE.COORDINATOR).first()
        if not coordinator_role:
            return

        assignments = ReceptionRoleAssignment.objects.filter(role=coordinator_role).select_related("user")
        recipients = [
            {
                "name": assignment.user.name,
                "email": assignment.user.email
            } for assignment in assignments
        ]

        if not recipients:
            return

        primary_customer = instance.customers.filter(
            customerrequestrelationship__customer_type__name="Primary Contact"
        ).first()

        for recipient in recipients:
            plain_text_message, html_message = new_request_email(
                receipient_name=recipient["name"],
                request=instance,
                customer=primary_customer,
            )
            send_email_notification(
                subject="TA Connect - New Request Submitted",
                plain_text_message=plain_text_message,
                html_message=html_message,
                recipient_list=[recipient["email"]],
            )

        if primary_customer:
            _send_customer_status_emails(instance, [primary_customer])

    transaction.on_commit(send_notifications)


@receiver(post_save, sender="core.Request")
def notify_owners_on_assignment(sender, instance, created, **kwargs):
    """
    After a Request is assigned to a Coordinator, Program Lead, Lab Lead, or Expert,
    email the relevant parties about the assignment.
    Note that this excludes the initial assignment that happens when a new Request is created.
    """
    if created:
        return

    owner_changed = getattr(instance, "_pre_save_owner_id", _UNSET) != instance.owner_id
    expert_changed = getattr(instance, "_pre_save_expert_id", _UNSET) != instance.expert_id
    if not (owner_changed or expert_changed):
        return

    match instance.owner.domain_type:
        case DOMAINTYPE.RECEPTION:
            reception_assignments = ReceptionRoleAssignment.objects.filter(role=Role.objects.get(name=ROLE.COORDINATOR))
            recipients = [
                {
                    "name": assignment.user.name,
                    "email": assignment.user.email
                } for assignment in reception_assignments
            ]
        case DOMAINTYPE.PROGRAM:
            program_assignments = ProgramRoleAssignment.objects.filter(role=Role.objects.get(name=ROLE.PROGRAM_LEAD), instance=instance.owner.program)
            recipients = [
                {
                    "name": assignment.user.name,
                    "email": assignment.user.email
                } for assignment in program_assignments
            ]
        case DOMAINTYPE.LAB:
            lab_assignments = LabRoleAssignment.objects.filter(role=Role.objects.get(name=ROLE.LAB_LEAD), instance=instance.owner.lab, program=instance.receipt.program)
            recipients = [
                {
                    "name": assignment.user.name,
                    "email": assignment.user.email
                } for assignment in lab_assignments
            ]

    primary_customer = instance.customers.filter(
        customerrequestrelationship__customer_type__name="Primary Contact"
    ).first()

    for recipient in recipients:
        plain_text_message, html_message = assignment_email(
            receipient_name=recipient["name"],
            request=instance,
            customer=primary_customer
        )
        send_email_notification(
            subject="TA Connect - Request Assigned to You",
            plain_text_message=plain_text_message,
            html_message=html_message,
            recipient_list=[recipient["email"]],
        )


@receiver(post_save, sender="core.Request")
def notify_customer_on_status_change(sender, instance, created, **kwargs):
    if created:
        return
    
    status_changed = getattr(instance, "_pre_save_status", _UNSET) != instance.status

    if not status_changed:
        return
    
    _send_customer_status_emails(instance, instance.customers.all())

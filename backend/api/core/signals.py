from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver

from core.models import User


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


@receiver(post_save, sender="core.Request")
def notify_reception_on_new_request(sender, instance, created, **kwargs):
    """
    After a new Request is saved for the first time, email all Reception
    Coordinators so they know a request is awaiting review.
    """
    if not created:
        return

    from core.models import ReceptionRoleAssignment, Role
    from core.constants import ROLE
    from core.util.notifications import send_email_notification
    from core.util.email_prompts import new_request_email

    coordinator_role = Role.objects.filter(name=ROLE.COORDINATOR).first()
    if not coordinator_role:
        return

    assignments = ReceptionRoleAssignment.objects.filter(role=coordinator_role).select_related("user")
    recipients = [assignment.user.email for assignment in assignments]
    recipients = [
        {
            "name": assignment.user.name,
            "email": assignment.user.email
        } for assignment in assignments
    ]

    if not recipients:
        return

    for recipient in recipients:
        plain_text_message, html_message = new_request_email(
            receipient_name=recipient["name"],
            request_id=instance.pk,
        )
        send_email_notification(
            subject="TA Connect - New Request Submitted",
            plain_text_message=plain_text_message,
            html_message=html_message,
            recipient_list=[recipient["email"]],
        )

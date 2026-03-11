from django.db.models.signals import pre_save
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

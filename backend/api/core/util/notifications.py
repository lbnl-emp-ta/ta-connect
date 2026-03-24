import logging
import os
import threading
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)


def send_email_notification(subject: str, plain_text_message: str, html_message: str, recipient_list: list[str]) -> None:
    """
    Send email with given information to a list of recipients.
    Dispatches the email in a background thread so the caller is not blocked
    by SMTP latency.
    Built in DEV mode by changing setting appropriate variable in settings.py
    """
    def _send():
        if settings.ENABLE_EMAIL_SENDING:
            try:
                send_mail(
                    subject=subject,
                    message=plain_text_message,
                    html_message=html_message,
                    from_email=os.getenv("TACONNECT_EMAIL_HOST_FROM_USER"),
                    recipient_list=recipient_list,
                    fail_silently=False,
                )
            except Exception:
                logger.exception(
                    "Failed to send email (subject=%r, recipients=%r)",
                    subject,
                    recipient_list,
                )
        else:
            email = dict()
            email["to"] = recipient_list
            email["from"] = os.getenv("TACONNECT_EMAIL_HOST_FROM_USER")
            email["subject"] = subject
            email["message"] = plain_text_message

            print(f"DEV (mocked email): {email}")

    threading.Thread(target=_send, daemon=True).start()
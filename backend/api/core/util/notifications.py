import os
from django.core.mail import send_mail
from django.conf import settings


def send_email_notification(subject: str, plain_text_message: str, html_message: str, recipient_list: list[str]) -> bool:
    """
    Send email with given information to a list of recipients.
    If the email was sent successfully, True is returned. False is returned otherwise.
    Built in DEV mode by changing setting appropriate variable in settings.py
    """
    if settings.ENABLE_EMAIL_SENDING:
        return bool(
            send_mail(
                subject=subject, 
                message=plain_text_message,
                html_message=html_message, 
                from_email=os.getenv("TACONNECT_EMAIL_HOST_FROM_USER"),
                recipient_list=recipient_list, 
                fail_silently=False
            ) 
        )
    else:
        email = dict()
        email["to"] = recipient_list
        email["from"] = os.getenv("TACONNECT_EMAIL_HOST_FROM_USER")
        email["subject"] = subject
        email["message"] = plain_text_message

        print(f"DEV (mocked email): {email}")

        return True
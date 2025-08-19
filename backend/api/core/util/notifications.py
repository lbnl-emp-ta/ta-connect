import os
from django.core.mail import send_mail
from django.conf import settings

# Send email with given information to a list of recipients.
# If the email was sent successfully, True is returned. False is returned otherwise.
# Built in DEV mode by changing setting appropriate variable in settings.py
def send_email_notification(subject: str, message: str, recipient_list: list[str]) -> bool:
    if settings.ENABLE_EMAIL_SENDING:
        return bool(
            send_mail(
                subject=subject, 
                message=message, 
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
        email["message"] = message

        print(f"DEV: {email} was sent")

        return True
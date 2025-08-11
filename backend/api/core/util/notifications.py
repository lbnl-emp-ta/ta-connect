import os
from django.core.mail import send_mail

# Send email with given information to a list of recipients. 
# If the email was sent successfully, True is returned. False is returned otherwise.
def send_email_notification(subject: str, message: str, recipient_list: list[str]) -> bool:
    return bool(
        send_mail(
            subject=subject, 
            message=message, 
            from_email=os.getenv("EMAIL_HOST_FROM_USER"),
            recipient_list=recipient_list, 
            fail_silently=False
        ) 
    )
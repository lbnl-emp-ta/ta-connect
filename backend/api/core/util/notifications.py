import os
from django.core.mail import send_mail

def send_email_notification(subject: str, message: str, recipient_list: list[str]) -> bool:
    return bool(
        send_mail(
            subject=subject, 
            message=message, 
            # from_email=os.getenv('EMAIL_HOST_USER'), 
            from_email="no-reply@taconnect@lbl.gov",
            recipient_list=recipient_list, 
            fail_silently=False
        ) 
    )
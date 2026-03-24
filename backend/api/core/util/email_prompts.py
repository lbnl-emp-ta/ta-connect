from django.conf import settings
from core.constants import DOMAINTYPE


def generic_template(receipient_name: str, message: str) -> str:
    template = f"""Hello {receipient_name},\n\n{message}\n\nThank you,\nTA Connect"""
    return template


def assignment_email(receipient_name: str, request_id: int, domain_type: DOMAINTYPE, program_name: str,  lab_name: str, expert_id: int) -> str:
    expert_str = ""
    location_str = ""
    match domain_type:
        case DOMAINTYPE.RECEPTION:
            location_str = "Reception"
        case DOMAINTYPE.PROGRAM:
            location_str = f"Program | {program_name}"
        case DOMAINTYPE.LAB:
            location_str = f"Lab | {lab_name} under Program | {program_name}"
    
    if expert_id:
        expert_str = f"you as an expert in "
    
    plain_text_message = f"""Hello {receipient_name},\n\nYou have received this email because Request #{request_id} has been assigned to {expert_str}{location_str}.
\n\nThank you,\nTA Connect"""
    
    html_message = f"""<div>Hello {receipient_name},</div><p>You have received this email because <a href="{settings.FRONTEND_URL}/dashboard/requests/{request_id}" target="_blank">Request #{request_id}</a> has been assigned to {expert_str}{location_str}.</p><div>Thank you,</div><div>TA Connect</div>"""
    
    return plain_text_message, html_message
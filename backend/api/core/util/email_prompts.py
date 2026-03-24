from django.conf import settings
from core.models import Customer, Request
from core.constants import DOMAINTYPE


def generic_template(receipient_name: str, message: str) -> str:
    template = f"""Hello {receipient_name},\n\n{message}\n\nThank you,\nTA Connect"""
    return template


def assignment_email(receipient_name: str, request: Request, customer: Customer) -> tuple[str, str]:
    request_id = request.id
    domain_type = request.owner.domain_type
    program_name = request.receipt.program.name if request.receipt.program else ""
    lab_name = request.receipt.lab.name if request.receipt.lab else ""
    expert_str = ""
    location_str = ""

    match domain_type:
        case DOMAINTYPE.RECEPTION:
            location_str = "Reception"
        case DOMAINTYPE.PROGRAM:
            location_str = f"Program | {program_name}"
        case DOMAINTYPE.LAB:
            location_str = f"Lab | {lab_name} under Program | {program_name}"
    
    if request.expert:
        expert_str = f"you as an expert in "
    
    plain_text_message = f"""
    Hello {receipient_name},
    
    You have received this email because Request #{request_id} has been assigned to {expert_str}{location_str}.
    
    Thank you,
    TA Connect
    """
    
    html_message = f"""
    <div>Hello {receipient_name},</div>
    <p>You have received this email because <a href="{settings.FRONTEND_URL}/dashboard/requests/{request_id}" target="_blank">Request #{request_id}</a> has been assigned to {expert_str}{location_str}.</p>
    <p>
        <h2>Request Details</h2>
        <ul>
            <li><strong>Request ID:</strong> {request_id}</li>
            <li><strong>Customer:</strong> {customer.name}</li>
            <li><strong>Domain Type:</strong> {domain_type}</li>
            <li><strong>Program Name:</strong> {program_name if program_name else "N/A"}</li>
            <li><strong>Lab Name:</strong> {lab_name if lab_name else "N/A"}</li>
            <li><strong>Assigned Expert:</strong> {request.expert.name if request.expert else "N/A"}</li>
        </ul>
    </p>
    <div>Thank you,</div>
    <div>TA Connect</div>
    """
    
    return plain_text_message, html_message


def new_request_email(receipient_name: str, request_id: int) -> tuple[str, str]:
    plain_text_message = (
        f"Hello {receipient_name},\n\n"
        f"A new request (Request #{request_id}) has been submitted and is awaiting review.\n\n"
        f"Thank you,\nTA Connect"
    )

    html_message = (
        f"<div>Hello {receipient_name},</div>"
        f"<p>A new request has been submitted and is awaiting your review: "
        f"<a href=\"{settings.FRONTEND_URL}/dashboard/requests/{request_id}\" target=\"_blank\">Request #{request_id}</a>.</p>"
        f"<div>Thank you,</div><div>TA Connect</div>"
    )

    return plain_text_message, html_message
from django.conf import settings
from core.models import Customer, Request
from core.constants import DOMAINTYPE


def assignment_email(receipient_name: str, request: Request, customer: Customer) -> tuple[str, str]:
    request_id = request.id
    domain_type = request.owner.domain_type
    program_name = "Not assigned"
    lab_name = "Not assigned"
    expert_str = ""
    location_str = ""

    if request.program:
        program_name = request.program.name
    if request.lab:
        lab_name = request.lab.name

    match domain_type:
        case DOMAINTYPE.RECEPTION:
            location_str = "Reception"
        case DOMAINTYPE.PROGRAM:
            location_str = f"Program | {program_name}"
        case DOMAINTYPE.LAB | DOMAINTYPE.EXPERT:
            location_str = f"Lab | {lab_name} under Program | {program_name}"
    
    if request.expert:
        expert_str = f"you as an expert in "
    
    plain_text_message = f"""
    Hello {receipient_name},
    
    You are receiving this email from TA Connect because Request #{request_id} has been assigned to {expert_str}{location_str}.
    
    Thank you,
    TA Connect
    """
    
    html_message = f"""
    <div>Hello {receipient_name},</div>
    <p>You are receiving this email from TA Connect because <a href="{settings.FRONTEND_URL}/dashboard/requests/{request_id}" target="_blank">Request #{request_id}</a> has been assigned to {expert_str}{location_str}.</p>
    <p>
        <h2>Request Details</h2>
        <ul>
            <li><strong>Request ID:</strong> {request_id}</li>
            <li><strong>Request Status:</strong> {request.status}</li>
            <li><strong>Customer:</strong> {customer.name}</li>
            <li><strong>Customer Organization:</strong> {customer.org}</li>
            <li><strong>Program Name:</strong> {program_name}</li>
            <li><strong>Lab Name:</strong> {lab_name}</li>
            <li><strong>Assigned Expert:</strong> {request.expert.name if request.expert else "Not assigned"}</li>
            <li><strong>Depth:</strong> {request.depth if request.depth else "Not assigned"}</li>
            <li><strong>Topics:</strong> {", ".join(topic.name for topic in request.topics.all()) or "Not assigned"}</li>
            <li><strong>Description:</strong> {request.description}</li>
        </ul>
    </p>
    <div>Thank you,</div>
    <div>TA Connect</div>
    """
    
    return plain_text_message, html_message


def new_request_email(receipient_name: str, request: Request, customer: Customer) -> tuple[str, str]:
    program_name = "Not assigned"
    lab_name = "Not assigned"
    if request.program:
        program_name = request.program.name
    if request.lab:
        lab_name = request.lab.name

    plain_text_message = f"""
    Hello {receipient_name},
    
    A new request (Request #{request.id}) has been submitted into TA Connect and is awaiting review.
    
    Thank you,
    TA Connect
    """

    html_message = f"""
    <div>Hello {receipient_name},</div>
    <p>A new request has been submitted into TA Connect and is awaiting your review: <a href=\"{settings.FRONTEND_URL}/dashboard/requests/{request.id}\" target=\"_blank\">Request #{request.id}</a>.</p>
    <p>
        <h2>Request Details</h2>
        <ul>
            <li><strong>Request ID:</strong> {request.id}</li>
            <li><strong>Request Status:</strong> {request.status}</li>
            <li><strong>Customer:</strong> {customer.name}</li>
            <li><strong>Customer Organization:</strong> {customer.org}</li>
            <li><strong>Program Name:</strong> {program_name}</li>
            <li><strong>Lab Name:</strong> {lab_name}</li>
            <li><strong>Assigned Expert:</strong> {request.expert.name if request.expert else "Not assigned"}</li>
            <li><strong>Depth:</strong> {request.depth if request.depth else "Not assigned"}</li>
            <li><strong>Topics:</strong> {", ".join(topic.name for topic in request.topics.all()) or "Not assigned"}</li>
            <li><strong>Description:</strong> {request.description}</li>
        </ul>
    </p>
    <div>Thank you,</div>
    <div>TA Connect</div>
    """

    return plain_text_message, html_message


def customer_status_email(receipient_name: str, request: Request) -> tuple[str, str]:
    program_name = "Not assigned"
    lab_name = "Not assigned"
    if request.program:
        program_name = request.program.name
    if request.lab:
        lab_name = request.lab.name

    plain_text_message = f"""
    Hello {receipient_name},
    
    Your request (Request #{request.id}) in TA Connect has been updated to {request.status}.
    
    Thank you,
    TA Connect
    """

    html_message = f"""
    <div>Hello {receipient_name},</div>
    <p>Your request in TA Connect has been updated to <strong>{request.status}</strong>.</p>
    <p>
        <h2>Request Details</h2>
        <ul>
            <li><strong>Request ID:</strong> {request.id}</li>
            <li><strong>Request Status:</strong> {request.status}</li>
            <li><strong>Program Name:</strong> {program_name}</li>
            <li><strong>Lab Name:</strong> {lab_name}</li>
            <li><strong>Assigned Expert:</strong> {request.expert.name if request.expert else "Not assigned"}</li>
            <li><strong>Depth:</strong> {request.depth if request.depth else "Not assigned"}</li>
            <li><strong>Topics:</strong> {", ".join(topic.name for topic in request.topics.all()) or "Not assigned"}</li>
            <li><strong>Description:</strong> {request.description}</li>
        </ul>
    </p>
    <div>Thank you,</div>
    <div>TA Connect</div>
    """

    return plain_text_message, html_message
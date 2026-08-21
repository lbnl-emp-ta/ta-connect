from django.conf import settings

from core.constants import DOMAINTYPE, REQUEST_STATUS
from core.models import Customer, Organization, Request


def assignment_email(receipient_name: str, request: Request, customer: Customer, organization: Organization) -> tuple[str, str]:
    request_id = request.id
    domain_type = request.owner.domain_type
    program_name = "-"
    lab_name = "-"
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
        expert_str = "you as an expert in "
    
    plain_text_message = f"""
    Hello {receipient_name},
    
    You are receiving this email from TA Connect because Request #{request_id} has been assigned to {expert_str}{location_str}.
    
    Thank you,
    TA Connect
    """
    
    html_message = f"""
    <div>Hello {receipient_name},</div>
    <p>You are receiving this email from TA Connect because <a href="{settings.FRONTEND_URL}/requests/active/{request_id}" target="_blank">Request #{request_id}</a> has been assigned to {expert_str}{location_str}.</p>
    <p>
        <h2>Request Details</h2>
        <ul>
            <li><strong>Request ID:</strong> {request_id}</li>
            <li><strong>Request Status:</strong> {request.status}</li>
            <li><strong>Customer:</strong> {customer.name}</li>
            <li><strong>Customer Organization:</strong> {organization.name}</li>
            <li><strong>Program Name:</strong> {program_name}</li>
            <li><strong>Lab Name:</strong> {lab_name}</li>
            <li><strong>Assigned Expert:</strong> {request.expert.name if request.expert else "-"}</li>
            <li><strong>Depth:</strong> {request.depth if request.depth else "-"}</li>
            <li><strong>Topics:</strong> {", ".join(topic.name for topic in request.topics.all()) or "-"}</li>
            <li><strong>Description:</strong> {request.description}</li>
        </ul>
    </p>
    <div>Thank you,</div>
    <div>TA Connect</div>
    """
    
    return plain_text_message, html_message


def new_request_email(receipient_name: str, request: Request, customer: Customer, organization: Organization) -> tuple[str, str]:
    program_name = "-"
    lab_name = "-"
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
    <p>A new request has been submitted into TA Connect and is awaiting your review: <a href=\"{settings.FRONTEND_URL}/requests/active/{request.id}\" target=\"_blank\">Request #{request.id}</a>.</p>
    <p>
        <h2>Request Details</h2>
        <ul>
            <li><strong>Request ID:</strong> {request.id}</li>
            <li><strong>Request Status:</strong> {request.status}</li>
            <li><strong>Customer:</strong> {customer.name}</li>
            <li><strong>Customer Organization:</strong> {organization.name}</li>
            <li><strong>Program Name:</strong> {program_name}</li>
            <li><strong>Lab Name:</strong> {lab_name}</li>
            <li><strong>Assigned Expert:</strong> {request.expert.name if request.expert else "-"}</li>
            <li><strong>Depth:</strong> {request.depth if request.depth else "-"}</li>
            <li><strong>Topics:</strong> {", ".join(topic.name for topic in request.topics.all()) or "-"}</li>
            <li><strong>Description:</strong> {request.description}</li>
        </ul>
    </p>
    <div>Thank you,</div>
    <div>TA Connect</div>
    """

    return plain_text_message, html_message


def customer_completed_email(receipient_name: str, request: Request) -> tuple[str, str]:
    program_name = "-"
    lab_name = "-"
    if request.program:
        program_name = request.program.name
    if request.lab:
        lab_name = request.lab.name

    plain_text_message = f"""
    Hello {receipient_name},
    
    Your request (Request #{request.id}) in TA Connect has been marked as completed.
    
    Please take a moment to fill out a brief customer feedback survey here: {settings.CUSTOMER_SURVEY_URL}{request.id}

    Thank you,
    TA Connect
    """

    html_message = f"""
    <div>Hello {receipient_name},</div>
    <p>Your request in TA Connect has been marked as <strong>{request.status}</strong>.</p>
    <p>Please take a moment to fill out a brief customer feedback survey here: <a href="{settings.CUSTOMER_SURVEY_URL}{request.id}" target="_blank">Request #{request.id} Feedback Survey</a>.</p>
    <p>
        <h2>Request Details</h2>
        <ul>
            <li><strong>Request ID:</strong> {request.id}</li>
            <li><strong>Request Status:</strong> {request.status}</li>
            <li><strong>Program Name:</strong> {program_name}</li>
            <li><strong>Lab Name:</strong> {lab_name}</li>
            <li><strong>Assigned Expert:</strong> {request.expert.name if request.expert else "-"}</li>
            <li><strong>Depth:</strong> {request.depth if request.depth else "-"}</li>
            <li><strong>Topics:</strong> {", ".join(topic.name for topic in request.topics.all()) or "-"}</li>
            <li><strong>Description:</strong> {request.description}</li>
        </ul>
    </p>
    <div>Thank you,</div>
    <div>TA Connect</div>
    """

    return plain_text_message, html_message


def customer_unable_to_address_email(receipient_name: str, request: Request) -> tuple[str, str]:
    program_name = "-"
    lab_name = "-"
    if request.program:
        program_name = request.program.name
    if request.lab:
        lab_name = request.lab.name

    plain_text_message = f"""
    Hello {receipient_name},
    
    Your request (Request #{request.id}) in TA Connect has been marked as unable to address.

    We're sorry that we weren't able to address your issue. If you have questions about why this request was marked as unable to address, please reach out to taconnect@lbl.gov.

    For any future requests, visit https://taconnect.lbl.gov/intake.
    
    Thank you,
    TA Connect
    """

    html_message = f"""
    <div>Hello {receipient_name},</div>
    <p>Your request in TA Connect has been marked as <strong>{request.status}</strong>.</p>
    <p>We're sorry that we weren't able to address your issue. If you have questions about why this request was marked as unable to address, please reach out to taconnect@lbl.gov.</p>
    <p>For any future requests, visit <a href="https://taconnect.lbl.gov/intake" target="_blank">https://taconnect.lbl.gov/intake</a>.
    <p>
        <h2>Request Details</h2>
        <ul>
            <li><strong>Request ID:</strong> {request.id}</li>
            <li><strong>Request Status:</strong> {request.status}</li>
            <li><strong>Program Name:</strong> {program_name}</li>
            <li><strong>Lab Name:</strong> {lab_name}</li>
            <li><strong>Assigned Expert:</strong> {request.expert.name if request.expert else "-"}</li>
            <li><strong>Depth:</strong> {request.depth if request.depth else "-"}</li>
            <li><strong>Topics:</strong> {", ".join(topic.name for topic in request.topics.all()) or "-"}</li>
            <li><strong>Description:</strong> {request.description}</li>
        </ul>
    </p>
    <div>Thank you,</div>
    <div>TA Connect</div>
    """

    return plain_text_message, html_message


def customer_status_email(receipient_name: str, request: Request) -> tuple[str, str]:
    if request.status.name == REQUEST_STATUS.COMPLETED.value:
        return customer_completed_email(receipient_name, request)
    
    if request.status.name == REQUEST_STATUS.UNABLE_TO_ADDRESS.value:
        return customer_unable_to_address_email(receipient_name, request)

    program_name = "-"
    lab_name = "-"
    if request.program:
        program_name = request.program.name
    if request.lab:
        lab_name = request.lab.name

    plain_text_message = f"""
    Hello {receipient_name},
    
    Your request (Request #{request.id}) in TA Connect has been updated to {request.status}!
    
    Thank you,
    TA Connect
    """

    html_message = f"""
    <div>Hello {receipient_name},</div>
    <p>Your request in TA Connect has been updated to <strong>{request.status}</strong>!</p>
    <p>
        <h2>Request Details</h2>
        <ul>
            <li><strong>Request ID:</strong> {request.id}</li>
            <li><strong>Request Status:</strong> {request.status}</li>
            <li><strong>Program Name:</strong> {program_name}</li>
            <li><strong>Lab Name:</strong> {lab_name}</li>
            <li><strong>Assigned Expert:</strong> {request.expert.name if request.expert else "-"}</li>
            <li><strong>Depth:</strong> {request.depth if request.depth else "-"}</li>
            <li><strong>Topics:</strong> {", ".join(topic.name for topic in request.topics.all()) or "-"}</li>
            <li><strong>Description:</strong> {request.description}</li>
        </ul>
    </p>
    <div>Thank you,</div>
    <div>TA Connect</div>
    """

    return plain_text_message, html_message
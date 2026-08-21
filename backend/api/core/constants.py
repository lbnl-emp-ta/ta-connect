from enum import Enum


class DOMAINTYPE(str, Enum):
    RECEPTION = "reception"
    PROGRAM = "program"
    LAB = "lab"
    EXPERT = "expert"


class ROLE(str, Enum):
    ADMIN = "Admin"
    COORDINATOR = "Coordinator"
    PROGRAM_LEAD = "Program Lead"
    LAB_LEAD = "Lab Lead"
    EXPERT = "Expert"


class REQUEST_STATUS(str, Enum):
    SCOPING = "scoping"  # Workflow: Assignment
    ASSIGNED_TO_PROGRAM = "assigned-to-program"  # Workflow: Assignment
    REJECTED_BY_PROGRAM = "rejected-by-program"  # Workflow: Assignment
    ASSIGNED_TO_LAB = "assigned-to-lab"  # Workflow: Assignment
    REJECTED_BY_LAB = "rejected-by-lab"  # Workflow: Assignment
    ASSIGNED_TO_EXPERT = "assigned-to-expert"  # Workflow: Delivery
    REJECTED_BY_EXPERT = "rejected-by-expert"  # Workflow: Assignment
    PROVIDING_TA = "providing-ta"  # Workflow: Delivery
    CLOSEOUT_STARTED = "closeout-started"  # Workflow: Delivery
    CLOSEOUT_MORE_INFO = "closeout-more-info"  # Workflow: Delivery
    CLOSEOUT_REVIEW_BY_LAB = "closeout-review-by-lab"  # Workflow: Review
    CLOSEOUT_REVIEW_BY_PROGRAM = "closeout-review-by-program"  # Workflow: Review
    COMPLETED = "completed"  # Workflow: Completed
    UNABLE_TO_ADDRESS = "unable-to-address"  # Workflow: Completed

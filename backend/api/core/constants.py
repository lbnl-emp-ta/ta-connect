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
    SCOPING = "scoping" # Workflow: Reception
    ASSIGNED_TO_PROGRAM = "assigned-to-program" # Workflow: Program
    REJECTED_BY_PROGRAM = "rejected-by-program" # Workflow: Reception
    ASSIGNED_TO_LAB = "assigned-to-lab" # Workflow: Lab
    REJECTED_BY_LAB = "rejected-by-lab" # Workflow: Program
    ASSIGNED_TO_EXPERT = "assigned-to-expert" # Workflow: Expert
    REJECTED_BY_EXPERT = "rejected-by-expert" # Workflow: Lab
    PROVIDING_TA = "providing-ta" # Workflow: Expert
    CLOSEOUT_STARTED = "closeout-started" # Workflow: Expert
    CLOSEOUT_MORE_INFO = "closeout-more-info" # Workflow: Expert
    CLOSEOUT_REVIEW_BY_LAB = "closeout-review-by-lab" # Workflow: Review
    CLOSEOUT_REVIEW_BY_PROGRAM = "closeout-review-by-program" # Workflow: Review
    COMPLETED = "completed" # Workflow: Completed
    UNABLE_TO_ADDRESS = "unable-to-address" # Workflow: Completed

# class REQUEST_STATUS(str, Enum):
#     SCOPING = "Scoping"
#     ASSIGNED_TO_PROGRAM = "Assigned to Program"
#     REJECTED_BY_PROGRAM = "Rejected by Program"
#     ASSIGNED_TO_LAB = "Assigned to Lab"
#     REASSIGNMENT_REQUESTED = "Reassignment Requested"
#     ASSIGNED_TO_EXPERT = "Assigned to Expert"
#     PROVIDING_TA = "Providing TA"
#     CLOSE_OUT = "Closeout"
#     CLOSE_OUT_COMPLETED = "Closeout Completed"
#     COMPLETED = "Completed"
#     UNABLE_TO_ADDRESS = "Unable to address"
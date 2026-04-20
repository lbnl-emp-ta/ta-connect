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
    SCOPING = "Scoping" # Workflow: Reception
    ASSIGNED_TO_PROGRAM = "Assigned to Program" # Workflow: Program
    REJECTED_BY_PROGRAM = "Rejected by Program" # Workflow: Reception
    ASSIGNED_TO_LAB = "Assigned to Lab" # Workflow: Lab
    REJECTED_BY_LAB = "Rejected by Lab" # Workflow: Program
    ASSIGNED_TO_EXPERT = "Assigned to Expert" # Workflow: Expert
    REJECTED_BY_EXPERT = "Rejected by Expert" # Workflow: Lab
    PROVIDING_TA = "Providing TA" # Workflow: Expert
    CLOSEOUT_STARTED = "Closeout Started" # Workflow: Expert
    CLOSEOUT_MORE_INFO = "Closeout needs more information from the expert" # Workflow: Expert
    CLOSEOUT_REVIEW_BY_LAB = "Closeout being reviewed by lab" # Workflow: Review
    CLOSEOUT_REVIEW_BY_PROGRAM = "Closeout being reviewed by program" # Workflow: Review
    COMPLETED = "Completed" # Workflow: Completed
    UNABLE_TO_ADDRESS = "Unable to address" # Workflow: Completed

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
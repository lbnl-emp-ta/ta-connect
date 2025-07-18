from enum import Enum

class DOMAINTYPE(str, Enum):
    RECEPTION = "reception"
    PROGRAM = "program" 
    LAB = "lab"

class ROLE(str, Enum):
    ADMIN = "Admin"
    COORDINATOR = "Coordinator"
    PROGRAM_LEAD = "Program Lead"
    LAB_LEAD = "Lab Lead"
    EXPERT = "Expert"

class REQUEST_STATUS(str, Enum):
    SCOPING = "Scoping"
    ASSIGNED_TO_PROGRAM = "Assigned to Program"
    REJECTED_BY_PROGRAM = "Rejected by Program"
    ASSIGNED_TO_LAB = "Assigned to Lab"
    REASSIGNMENT_REQUESTED = "Reassignment Requested"
    ASSIGNED_TO_EXPERT = "Assigned to Expert"
    PROVIDING_TA = "Providing TA"
    CLOSE_OUT = "Close out"
    CLOSE_OUT_COMPLETED = "Closeout Completed"
    COMPLETED = "Completed"
    UNABLE_TO_ADDRESS = "Unable to address"
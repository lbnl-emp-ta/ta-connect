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
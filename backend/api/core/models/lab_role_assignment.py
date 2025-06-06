from django.db import models
from core.models import *

class LabRoleAssignment(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    role = models.ForeignKey(Role, on_delete=models.PROTECT)
    instance = models.ForeignKey(Lab, on_delete=models.PROTECT)

    #   Sometimes the role is not specific to a Program.
    #
    #   Ex. There exists a Lab Lead POC for each Program 
    #   (in this case a Program should be specified)
    #
    #   Ex. Experts are Program agnostic, they are a Lab human 
    #   resource that may be shared among different Programs
    #   (in this case it would not make sense to specify Program)
    program = models.ForeignKey(Program, blank=True, null=True, on_delete=models.PROTECT) 
    date_assigned = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "lab_role_assignment"

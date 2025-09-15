from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from core.models import *

admin.site.unregister(Group)

admin.site.register(get_user_model())
admin.site.register(Request)
admin.site.register(Customer)
admin.site.register(CustomerRequestRelationship)
admin.site.register(Organization)
admin.site.register(OrganizationType)
admin.site.register(Program)
admin.site.register(Lab)
admin.site.register(Reception)
admin.site.register(Owner)
admin.site.register(LabRoleAssignment)
admin.site.register(Receipt)
admin.site.register(Topic)
admin.site.register(Expertise)
admin.site.register(Role)
admin.site.register(ProgramRoleAssignment)
admin.site.register(SystemRoleAssignment)
admin.site.register(ReceptionRoleAssignment)
admin.site.register(Depth)
admin.site.register(RequestStatus)
admin.site.register(TransmissionPlanningRegion)
admin.site.register(Attachment)
admin.site.register(AuditHistory)
admin.site.register(SharedFundingGroup)
admin.site.register(Note)
admin.site.register(Cohort)
admin.site.register(CohortParticipant)

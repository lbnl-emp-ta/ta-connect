from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from import_export import fields, resources
from import_export.admin import ImportExportModelAdmin
from core.models import *

admin.site.unregister(Group)


class RequestResource(resources.ModelResource):
    customer_name = fields.Field(column_name='Customer Name', readonly=True)
    customer_email = fields.Field(column_name='Customer Email', readonly=True)

    class Meta:
        model = Request
        fields = (
            'id',
            'customer_name',
            'customer_email',
            'owner',
            'program',
            'lab',
            'expert',
            'organization',
            'status',
            'depth',
            'description',
            'challenges',
            'goals',
            'effort',
            'date_created',
            'proj_start_date',
            'proj_completion_date',
            'actual_completion_date',
            'topics',
        )

    def dehydrate_owner(self, obj):
        return str(obj.owner) if obj.owner else ''

    def dehydrate_customer_name(self, obj):
        return ', '.join(obj.customers.order_by('pk').values_list('name', flat=True))

    def dehydrate_customer_email(self, obj):
        return ', '.join(obj.customers.order_by('pk').values_list('email', flat=True))

    def dehydrate_program(self, obj):
        return obj.program.name if obj.program else ''

    def dehydrate_lab(self, obj):
        return obj.lab.name if obj.lab else ''

    def dehydrate_expert(self, obj):
        return obj.expert.email if obj.expert else ''

    def dehydrate_organization(self, obj):
        return obj.organization.name if obj.organization else ''

    def dehydrate_status(self, obj):
        return obj.status.name if obj.status else ''

    def dehydrate_depth(self, obj):
        return obj.depth.name if obj.depth else ''

    def dehydrate_topics(self, obj):
        return ', '.join(obj.topics.values_list('name', flat=True))


class RequestAdmin(ImportExportModelAdmin):
    resource_classes = [RequestResource]


admin.site.register(get_user_model())
admin.site.register(Request, RequestAdmin)
admin.site.register(Customer)
admin.site.register(CustomerRequestRelationship)
admin.site.register(Organization)
admin.site.register(OrganizationType)
admin.site.register(Program)
admin.site.register(Lab)
admin.site.register(Reception)
admin.site.register(Owner)
admin.site.register(LabRoleAssignment)
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
admin.site.register(CloseoutForm)

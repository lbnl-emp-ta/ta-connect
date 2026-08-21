import os
import shutil
import tempfile
import zipfile

from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.http import FileResponse
from django.utils import timezone
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


class CustomerResource(resources.ModelResource):
    class Meta:
        model = Customer
        fields = (
            'id',
            'email',
            'name',
            'phone',
            'title',
        )


class CustomerAdmin(ImportExportModelAdmin):
    resource_classes = [CustomerResource]


class UserResource(resources.ModelResource):
    class Meta:
        model = get_user_model()
        fields = (
            'id',
            'email',
            'name',
            'phone',
            'is_staff',
            'is_superuser',
            'is_active',
            'last_login',
            'date_joined',
        )


class UserAdmin(ImportExportModelAdmin):
    resource_classes = [UserResource]


class OrganizationResource(resources.ModelResource):
    class Meta:
        model = Organization
        fields = (
            'id',
            'name',
            'address',
            'state',
            'transmission_planning_region',
            'type',
        )


class OrganizationAdmin(ImportExportModelAdmin):
    resource_classes = [OrganizationResource]


class AttachmentResource(resources.ModelResource):
    class Meta:
        model = Attachment
        fields = (
            'id',
            'request',
            'file',
            'description',
            'uploaded_at',
        )


class AttachmentAdmin(ImportExportModelAdmin):
    resource_classes = [AttachmentResource]
    actions = ['export_attachment_files']

    @admin.action(description='Download selected attachment files as ZIP')
    def export_attachment_files(self, request, queryset):
        """Return the selected files in a ZIP without assuming local storage."""
        # FileResponse takes ownership of this stream and closes it after sending.
        archive = tempfile.SpooledTemporaryFile(max_size=10 * 1024 * 1024)  # noqa: SIM115

        with zipfile.ZipFile(archive, mode='w', compression=zipfile.ZIP_DEFLATED) as zip_file:
            for attachment in queryset.select_related('request').iterator():
                filename = os.path.basename(attachment.file.name)
                archive_name = f'request_ID{attachment.request_id}/{filename}'
                uploaded_at = attachment.uploaded_at
                if timezone.is_aware(uploaded_at):
                    uploaded_at = timezone.localtime(uploaded_at)
                zip_info = zipfile.ZipInfo(
                    archive_name,
                    date_time=uploaded_at.timetuple()[:6],
                )
                zip_info.compress_type = zipfile.ZIP_DEFLATED

                # FileField.open() works for local and remote Django storage backends.
                with (
                    attachment.file.open('rb') as source,
                    zip_file.open(zip_info, mode='w') as destination,
                ):
                    shutil.copyfileobj(source, destination)

        archive.seek(0)
        return FileResponse(
            archive,
            as_attachment=True,
            filename='attachments.zip',
            content_type='application/zip',
        )


admin.site.register(get_user_model(), UserAdmin)
admin.site.register(Request, RequestAdmin)
admin.site.register(Customer, CustomerAdmin)
admin.site.register(CustomerRequestRelationship)
admin.site.register(Organization, OrganizationAdmin)
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
admin.site.register(Attachment, AttachmentAdmin)
admin.site.register(AuditHistory)
admin.site.register(SharedFundingGroup)
admin.site.register(Note)
admin.site.register(Cohort)
admin.site.register(CohortParticipant)
admin.site.register(CloseoutForm)

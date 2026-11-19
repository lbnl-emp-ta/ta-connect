import os
import shutil
import tempfile
import zipfile

from allauth.socialaccount.models import SocialAccount
from django.conf import settings
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import (
    AdminUserCreationForm,
    UserChangeForm,
)
from django.contrib.auth.models import Group
from django.core.exceptions import ValidationError
from django.http import FileResponse
from django.utils import timezone
from import_export import fields, resources
from import_export.admin import ImportExportMixin, ImportExportModelAdmin

from core.models import *

admin.site.unregister(Group)


class RequestResource(resources.ModelResource):
    customer_name = fields.Field(column_name="Customer Name", readonly=True)
    customer_email = fields.Field(column_name="Customer Email", readonly=True)

    class Meta:
        model = Request
        fields = (
            "id",
            "customer_name",
            "customer_email",
            "owner",
            "program",
            "lab",
            "expert",
            "organization",
            "status",
            "depth",
            "description",
            "challenges",
            "goals",
            "effort",
            "date_created",
            "proj_start_date",
            "proj_completion_date",
            "actual_completion_date",
            "topics",
        )

    def dehydrate_owner(self, obj):
        return str(obj.owner) if obj.owner else ""

    def dehydrate_customer_name(self, obj):
        return ", ".join(obj.customers.order_by("pk").values_list("name", flat=True))

    def dehydrate_customer_email(self, obj):
        return ", ".join(obj.customers.order_by("pk").values_list("email", flat=True))

    def dehydrate_program(self, obj):
        return obj.program.name if obj.program else ""

    def dehydrate_lab(self, obj):
        return obj.lab.name if obj.lab else ""

    def dehydrate_expert(self, obj):
        return obj.expert.email if obj.expert else ""

    def dehydrate_organization(self, obj):
        return obj.organization.name if obj.organization else ""

    def dehydrate_status(self, obj):
        return obj.status.name if obj.status else ""

    def dehydrate_depth(self, obj):
        return obj.depth.name if obj.depth else ""

    def dehydrate_topics(self, obj):
        return ", ".join(obj.topics.values_list("name", flat=True))


class RequestAdmin(ImportExportModelAdmin):
    resource_classes = [RequestResource]


class CustomerResource(resources.ModelResource):
    class Meta:
        model = Customer
        fields = (
            "id",
            "email",
            "name",
            "phone",
            "title",
        )


class CustomerAdmin(ImportExportModelAdmin):
    resource_classes = [CustomerResource]


def validate_admin_user_email(email: str | None, user=None) -> None:
    """
    Ensure accounts created via Django admin (or email edits on non-ORCID accounts
    in Django admin) use an email from settings.APPROVED_ADMIN_EMAILS.
    """
    user_model = get_user_model()
    normalized = (email or "").strip().lower()

    if user is not None and user.pk is not None and not user._state.adding:
        if SocialAccount.objects.filter(user_id=user.pk, provider="orcid").exists():
            return

        existing_email = (
            user_model.objects.values_list("email", flat=True)
            .filter(pk=user.pk)
            .first()
        )
        if existing_email is not None and existing_email.strip().lower() == normalized:
            return

    if not normalized or normalized not in settings.APPROVED_ADMIN_EMAILS:
        raise ValidationError("Email address is not approved.")


class CustomAdminUserCreationForm(AdminUserCreationForm):
    class Meta:
        model = get_user_model()
        fields = ("email", "name", "phone")
        field_classes = {}

    def clean_email(self):
        email = self.cleaned_data.get("email")
        validate_admin_user_email(email)
        if email and self._meta.model.objects.filter(email__iexact=email).exists():
            raise ValidationError(
                self.instance.unique_error_message(self._meta.model, ["email"])
            )
        return email


class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = get_user_model()
        fields = "__all__"
        field_classes = {}

    def clean_email(self):
        email = self.cleaned_data.get("email")
        validate_admin_user_email(email, user=self.instance)
        if (
            email
            and self._meta.model.objects.exclude(pk=self.instance.pk)
            .filter(email__iexact=email)
            .exists()
        ):
            raise ValidationError(
                self.instance.unique_error_message(self._meta.model, ["email"])
            )
        return email


class UserResource(resources.ModelResource):
    class Meta:
        model = get_user_model()
        fields = (
            "id",
            "email",
            "name",
            "phone",
            "is_staff",
            "is_superuser",
            "is_active",
            "last_login",
            "date_joined",
        )

    def validate_instance(
        self, instance, import_validation_errors=None, validate_unique=True
    ):
        if import_validation_errors is None:
            import_validation_errors = {}
        else:
            import_validation_errors = import_validation_errors.copy()

        try:
            validate_admin_user_email(instance.email, user=instance)
        except ValidationError as exc:
            import_validation_errors = ValidationError(
                {"email": exc}
            ).update_error_dict(import_validation_errors)

        super().validate_instance(
            instance,
            import_validation_errors=import_validation_errors,
            validate_unique=validate_unique,
        )

    def before_save_instance(self, instance, row, **kwargs):
        if instance._state.adding and not instance.password:
            instance.set_unusable_password()


class UserAdmin(ImportExportMixin, BaseUserAdmin):
    resource_classes = [UserResource]
    form = CustomUserChangeForm
    add_form = CustomAdminUserCreationForm
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("name", "phone")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "name",
                    "phone",
                    "usable_password",
                    "password1",
                    "password2",
                ),
            },
        ),
    )
    readonly_fields = ("date_joined",)
    list_display = ("email", "name", "is_staff", "is_superuser", "is_active")
    list_filter = ("is_staff", "is_superuser", "is_active")
    search_fields = ("email", "name")
    ordering = ("email",)


class OrganizationResource(resources.ModelResource):
    class Meta:
        model = Organization
        fields = (
            "id",
            "name",
            "address",
            "state",
            "transmission_planning_region",
            "type",
        )


class OrganizationAdmin(ImportExportModelAdmin):
    resource_classes = [OrganizationResource]


class AttachmentResource(resources.ModelResource):
    class Meta:
        model = Attachment
        fields = (
            "id",
            "request",
            "file",
            "description",
            "uploaded_at",
        )


class AttachmentAdmin(ImportExportModelAdmin):
    resource_classes = [AttachmentResource]
    actions = ["export_attachment_files"]

    @admin.action(description="Download selected attachment files as ZIP")
    def export_attachment_files(self, request, queryset):
        """Return the selected files in a ZIP without assuming local storage."""
        # FileResponse takes ownership of this stream and closes it after sending.
        archive = tempfile.SpooledTemporaryFile(max_size=10 * 1024 * 1024)  # noqa: SIM115

        with zipfile.ZipFile(
            archive, mode="w", compression=zipfile.ZIP_DEFLATED
        ) as zip_file:
            for attachment in queryset.select_related("request").iterator():
                filename = os.path.basename(attachment.file.name)
                archive_name = f"request_ID{attachment.request_id}/{filename}"
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
                    attachment.file.open("rb") as source,
                    zip_file.open(zip_info, mode="w") as destination,
                ):
                    shutil.copyfileobj(source, destination)

        archive.seek(0)
        return FileResponse(
            archive,
            as_attachment=True,
            filename="attachments.zip",
            content_type="application/zip",
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

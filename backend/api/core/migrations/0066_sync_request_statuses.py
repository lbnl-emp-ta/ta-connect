from django.db import migrations

# Keep this data in the migration rather than loading status_role_fixture.json.
# Migrations must remain reproducible if that fixture changes again later.
REQUEST_STATUSES = {
    "scoping": "The default status of a new Request",
    "assigned-to-program": "Request has been assigned to a program by reception",
    "rejected-by-program": "The request was rejected by the assigned program",
    "assigned-to-lab": "Request has been assigned to a lab by a program",
    "rejected-by-lab": "The request was rejected by the assigned lab",
    "assigned-to-expert": "Request has been assigned to an expert by a lab",
    "rejected-by-expert": "The request was rejected by the assigned expert",
    "providing-ta": (
        "Expert is currently providing technical assistance to the customer"
    ),
    "closeout-started": "Expert has started the closeout process",
    "closeout-more-info": ("Closeout was returned to the expert for more information"),
    "closeout-review-by-lab": "Closeout forms are being reviewed by the lab",
    "closeout-review-by-program": ("Closeout forms are being reviewed by the program"),
    "completed": (
        "Technical assistance associated with the request has been fulfilled"
    ),
    "unable-to-address": (
        "Request was not able to be serviced by any available program"
    ),
}


# Map values used by earlier fixtures/application versions to their current
# semantic equivalent. In particular, the previous fixture used pk=10 twice,
# so primary keys cannot safely be used to identify the old values.
LEGACY_STATUS_NAMES = {
    "Scoping": "scoping",
    "Assigned to Program": "assigned-to-program",
    "Rejected by Program": "rejected-by-program",
    "Assigned to Lab": "assigned-to-lab",
    "Reassignment Requested": "rejected-by-lab",
    "Rejected by Lab": "rejected-by-lab",
    "Assigned to Expert": "assigned-to-expert",
    "Rejected by Expert": "rejected-by-expert",
    "Providing TA": "providing-ta",
    "Close out": "closeout-started",
    "Closeout": "closeout-started",
    "Closeout Started": "closeout-started",
    "Closeout needs more information from the expert": "closeout-more-info",
    "Closeout Completed": "closeout-review-by-lab",
    "Closeout being reviewed by lab": "closeout-review-by-lab",
    "Closeout being reviewed by program": "closeout-review-by-program",
    "Completed": "completed",
    "Unable to address": "unable-to-address",
}


# Role/status relationships are also fixture-backed and must be synchronized
# when new statuses are introduced, otherwise those statuses are unavailable in
# the workflow for existing environments.
ROLE_STATUSES = {
    "Admin": tuple(REQUEST_STATUSES),
    "Coordinator": ("scoping", "rejected-by-program", "unable-to-address"),
    "Program Lead": (
        "assigned-to-program",
        "rejected-by-program",
        "assigned-to-lab",
        "rejected-by-lab",
        "closeout-review-by-program",
    ),
    "Lab Lead": (
        "assigned-to-lab",
        "rejected-by-lab",
        "assigned-to-expert",
        "rejected-by-expert",
        "closeout-review-by-lab",
    ),
    "Expert": (
        "assigned-to-expert",
        "rejected-by-expert",
        "providing-ta",
        "closeout-started",
        "closeout-more-info",
    ),
}


def sync_request_statuses(apps, schema_editor):
    Request = apps.get_model("core", "Request")
    RequestStatus = apps.get_model("core", "RequestStatus")
    Role = apps.get_model("core", "Role")

    for legacy_name, current_name in LEGACY_STATUS_NAMES.items():
        legacy_status = RequestStatus.objects.filter(name=legacy_name).first()
        if legacy_status is None:
            continue

        current_status = RequestStatus.objects.filter(name=current_name).first()
        if current_status is None:
            legacy_status.name = current_name
            legacy_status.description = REQUEST_STATUSES[current_name]
            legacy_status.save(update_fields=["name", "description"])
            continue

        # A database may contain both a legacy value and its replacement. Merge
        # their references before removing the duplicate legacy row.
        Request.objects.filter(status_id=legacy_status.pk).update(
            status_id=current_status.pk
        )
        for role in legacy_status.roles.all():
            role.statuses.add(current_status)
        legacy_status.delete()

    statuses = {}
    for name, description in REQUEST_STATUSES.items():
        status, _ = RequestStatus.objects.update_or_create(
            name=name,
            defaults={"description": description},
        )
        statuses[name] = status

    for role_name, status_names in ROLE_STATUSES.items():
        for role in Role.objects.filter(name=role_name):
            role.statuses.set(statuses[name] for name in status_names)


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0065_alter_cohort_request"),
    ]

    operations = [
        migrations.RunPython(sync_request_statuses, migrations.RunPython.noop),
    ]

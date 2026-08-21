from django.db import models
from django.db.models import CheckConstraint, F, Q

from core.models import *


class Request(models.Model):
    """
    Represent the requests coming in from customers for technical assistance.
    """
    class EffortLevel(models.TextChoices):
        ONE_DAY_OR_LESS = "1 day or less", "1 day or less"
        UP_TO_THREE_WEEKS = "Up to 3 weeks (15 days)", "Up to 3 weeks (15 days)"
        MORE_THAN_THREE_WEEKS = "More than 3 weeks", "More than 3 weeks"
        UNSURE = "Unsure", "Unsure"

    owner = models.ForeignKey(Owner, on_delete=models.PROTECT, blank=True, null=True, default=Owner.get_default_pk)
    program = models.ForeignKey(Program, on_delete=models.PROTECT, blank=True, null=True)
    lab = models.ForeignKey(Lab, on_delete=models.PROTECT, blank=True, null=True)
    expert = models.ForeignKey(User, on_delete=models.PROTECT, blank=True, null=True)
    organization = models.ForeignKey(Organization, on_delete=models.SET_NULL, null=True, blank=True, related_name="requests")
    status = models.ForeignKey(RequestStatus, on_delete=models.PROTECT, default=RequestStatus.get_default_pk)
    depth = models.ForeignKey(Depth, on_delete=models.PROTECT, blank=True, null=True, default=Depth.get_default_pk)
    description = models.TextField(blank=True, null=True)
    challenges = models.TextField(blank=True, null=True)
    goals = models.TextField(blank=True, null=True)
    effort = models.CharField(max_length=25, choices=EffortLevel.choices, blank=True, null=True)
    date_created = models.DateTimeField(auto_now_add=True)
    proj_start_date = models.DateField(blank=True, null=True, verbose_name="projected start date")
    proj_completion_date = models.DateField(blank=True, null=True, verbose_name="projected completion date")
    actual_completion_date = models.DateField(blank=True, null=True)
    topics = models.ManyToManyField(Topic, blank=True, related_name="requests")

    def __str__(self):
        return f"Request #{self.pk}"

    class Meta:
        db_table = "request"
        constraints = [
            # The projected completion date must be after the projected start date (if both are provided)
            CheckConstraint(
                condition = Q(proj_completion_date__gt=F('proj_start_date')) | Q(proj_start_date__isnull=True),
                name = "projected_completion_date_after_projected_start_date_or_null",
                violation_error_message="The projected completion date must be after the projected start date"
            ),
            # The projected start date must be before the projected completion date (if both are provided)
            CheckConstraint(
                condition = Q(proj_start_date__lt=F('proj_completion_date')) | Q(proj_completion_date__isnull=True),
                name = "projected_start_date_before_projected_completion_date_or_null",
                violation_error_message="The projected start date must be before the projected completion date"
            ),
            # lab can only be set if program is also set
            CheckConstraint(
                condition=Q(lab__isnull=True) | Q(program__isnull=False),
                name="lab_requires_program",
                violation_error_message="A program must be assigned before a lab can be assigned"
            ),
            # expert can only be set if lab is also set
            CheckConstraint(
                condition=Q(expert__isnull=True) | Q(lab__isnull=False),
                name="expert_requires_lab",
                violation_error_message="A lab must be assigned before an expert can be assigned"
            ),
        ]
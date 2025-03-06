import datetime

from django.db import models
from django.db.models import CheckConstraint, Q, F
from core.models import RequestStatus

class Request(models.Model):
    """
    Represent the requests coming in from customers for technical assistance.
    """
    status = models.ForeignKey(RequestStatus, on_delete=models.PROTECT, default=RequestStatus.get_default_pk)
    description = models.TextField()
    date_created = models.DateTimeField(auto_now_add=True)
    proj_start_date = models.DateField(blank=True, null=True, verbose_name="projected start date")
    proj_completion_date = models.DateField(blank=True, null=True, verbose_name="projected completion date")
    actual_completion_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"Request #{self.pk}"

    
    class Meta:
        db_table = "request"
        constraints = [
            CheckConstraint(
                check = Q(proj_start_date__gte=datetime.date.today()) | Q(proj_start_date__isnull=True),
                name = "projected_start_date_in_future_or_null",
                violation_error_message="The projected start date must not be set in the past."
            ),
            CheckConstraint(
                check = Q(proj_completion_date__gte=datetime.date.today()) | Q(proj_completion_date__isnull=True),
                name = "projected_completion_date_in_future_or_null",
                violation_error_message="The projected completion date must not be set in the past."
            ),
            CheckConstraint(
                check = Q(proj_completion_date__gt=F('proj_start_date')) | Q(proj_start_date__isnull=True),
                name = "projected_completion_date_after_projected_start_date_or_null",
                violation_error_message="The projected completion date must be after the projected start date"
            ),
            CheckConstraint(
                check = Q(proj_start_date__lt=F('proj_completion_date')) | Q(proj_completion_date__isnull=True),
                name = "projected_start_date_before_projected_completion_date_or_null",
                violation_error_message="The projected start date must be before the projected completion date"
            )
        ]
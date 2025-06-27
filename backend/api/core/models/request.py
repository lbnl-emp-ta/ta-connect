from django.db import models
from django.db.models import CheckConstraint, Q, F
from core.models import * 

class Request(models.Model):
    """
    Represent the requests coming in from customers for technical assistance.
    """
    owner = models.ForeignKey(Owner, on_delete=models.PROTECT, blank=True, null=True, default=Owner.get_default_pk)
    expert = models.ForeignKey(User, on_delete=models.PROTECT, blank=True, null=True)
    status = models.ForeignKey(RequestStatus, on_delete=models.PROTECT, default=RequestStatus.get_default_pk)
    depth = models.ForeignKey(Depth, on_delete=models.PROTECT, default=Depth.get_default_pk)
    description = models.TextField()
    date_created = models.DateTimeField(auto_now_add=True)
    proj_start_date = models.DateField(blank=True, null=True, verbose_name="projected start date")
    proj_completion_date = models.DateField(blank=True, null=True, verbose_name="projected completion date")
    actual_completion_date = models.DateField(blank=True, null=True)

    receipt = models.OneToOneField(Receipt, blank=True, null=True, on_delete=models.PROTECT)

    def __str__(self):
        return f"Request #{self.pk}"

    def save(self, *args, **kwargs):
        if not (self.receipt):
            self.receipt, _ = Receipt.objects.get_or_create()

        super(Request, self).save(*args, **kwargs)
    
    class Meta:
        db_table = "request"
        constraints = [
            CheckConstraint(
                condition = Q(proj_completion_date__gt=F('proj_start_date')) | Q(proj_start_date__isnull=True),
                name = "projected_completion_date_after_projected_start_date_or_null",
                violation_error_message="The projected completion date must be after the projected start date"
            ),
            CheckConstraint(
                condition = Q(proj_start_date__lt=F('proj_completion_date')) | Q(proj_completion_date__isnull=True),
                name = "projected_start_date_before_projected_completion_date_or_null",
                violation_error_message="The projected start date must be before the projected completion date"
            )
        ]
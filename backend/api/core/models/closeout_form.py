from django.db import models
from core.models import * 

class CloseoutForm(models.Model):
    """
    The closeout form that must be filled out when a request is being closed.
    This form is meant to capture information about the resolution of the request.
    """
    request = models.OneToOneField(Request, on_delete=models.CASCADE, related_name="closeout_form")
    submitted_date = models.DateTimeField(auto_now_add=True)
    approved_by_lab = models.BooleanField(default=False)
    approved_by_program = models.BooleanField(default=False)
    experience_description = models.TextField(blank=True, null=True, verbose_name="Short description of the experience")
    ta_provided_description = models.TextField(blank=True, null=True, verbose_name="What was provided to meet the request?")
    impact_description = models.TextField(blank=True, null=True, verbose_name="What is the likely impact on the stakeholder?")
    alignment_description = models.TextField(blank=True, null=True, verbose_name="Did the final TA align with the original request?")
    customer_feedback = models.TextField(blank=True, null=True, verbose_name="Any feedback or comments from TA requester?")
    follow_up_needed = models.BooleanField(default=False, verbose_name="Request follow-up/additional TA?")
    follow_up_description = models.TextField(blank=True, null=True, verbose_name="What is the scope of the additional TA effort? (topics, etc.)")
    follow_up_duration = models.CharField(max_length=256, blank=True, null=True, verbose_name="How much additional time is needed?")
    follow_up_comments = models.TextField(blank=True, null=True, verbose_name="Other questions/comments regarding follow-up TA")
    follow_up_has_same_expert = models.BooleanField(default=False, verbose_name="Do you want to be an SME for any follow-up?")

    def __str__(self):
        return f"Closeout Form for Request #{self.request.pk}"

    class Meta:
        db_table = "closeout_form"
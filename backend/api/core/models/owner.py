from django.db import IntegrityError, models
from django.db.models import CheckConstraint, Q

from core.models import Reception, Program, Lab, Team

class Owner(models.Model):
    class DomainType(models.TextChoices):
        Reception = "reception"
        Program = "program"    
        Lab = "lab"
        Team = "team"

    domain_type = models.CharField(max_length=16, choices=DomainType)
    reception = models.ForeignKey(Reception, on_delete=models.PROTECT, null=True, blank=True)
    program = models.ForeignKey(Program, on_delete=models.PROTECT, null=True, blank=True)
    lab = models.ForeignKey(Lab, on_delete=models.PROTECT, null=True, blank=True)
    team = models.ForeignKey(Team, on_delete=models.PROTECT, null=True, blank=True)

    def clean(self):
        # Count how many fields are non-null
        non_null_fields = sum([
            bool(self.a),
            bool(self.b),
            bool(self.c),
            bool(self.d),
        ])
        if non_null_fields != 1:
            raise IntegrityError("Exactly one of reception, program, lab, or team must be set.")

    class Meta:
        constraints = [
            # Only one of the fields can be non-null
            CheckConstraint(
                check=(
                    (
                        (Q(reception__isnull=False) & Q(program__isnull=True) & Q(lab__isnull=True) & Q(team__isnull=True)) |
                        (Q(reception__isnull=True) & Q(program__isnull=False) & Q(lab__isnull=True) & Q(team__isnull=True)) |
                        (Q(reception__isnull=True) & Q(program__isnull=True) & Q(lab__isnull=False) & Q(team__isnull=True)) |
                        (Q(reception__isnull=True) & Q(program__isnull=True) & Q(lab__isnull=True) & Q(team__isnull=False))
                    )
                ),
                name="only_one_fk_non_null"
            )
        ]
        db_table = "owner"
from django.db import IntegrityError, models
from django.db.models import CheckConstraint, Q

from core.models import * 

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
    expert = models.ForeignKey(User, on_delete=models.PROTECT, null=True, blank=True)

    def clean(self):
        # Count how many fields are non-null
        non_null_fields = sum([
            bool(self.reception),
            bool(self.program),
            bool(self.lab),
        ])
        if non_null_fields != 1:
            raise IntegrityError("Exactly one of reception, program, or lab must be set.")

    @classmethod 
    def get_default_pk(cls):
        owner, _ = cls.objects.get_or_create(
            domain_type=Owner.DomainType.Reception,
            reception=Reception.objects.get(pk=Reception.get_default_pk())
        )

        return owner.pk

    def __str__(self):
        if (self.pk == Reception.get_default_pk()):
            return "Reception Owner"

        return f"Owner #{self.pk}"

    class Meta:
        constraints = [
            # Only one of the fields can be non-null
            CheckConstraint(
                condition=(
                    (
                        (Q(reception__isnull=False) & Q(program__isnull=True) & Q(lab__isnull=True)) |
                        (Q(reception__isnull=True) & Q(program__isnull=False) & Q(lab__isnull=True)) |
                        (Q(reception__isnull=True) & Q(program__isnull=True) & Q(lab__isnull=False))
                    )
                ),
                name="only_one_fk_non_null"
            )
        ]
        db_table = "owner"
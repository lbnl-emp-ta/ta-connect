from django.db import IntegrityError, models
from django.db.models import CheckConstraint, Q
from django.db.models.signals import post_save
from django.dispatch import receiver


from core.models import * 
from core.constants import DOMAINTYPE

# Keeps track of where a Request is assigned. Each instance of Reception(should only be one), Program,
# and Lab will have an Owner instance generated as soon as they come into existance. If a Reception/Lab/Program
# is a person, the associated Owner instance is its bag that holds a Request.
class Owner(models.Model):
    class DomainType(models.TextChoices):
        Reception = "reception"
        Program = "program"    
        Lab = "lab"

    domain_type = models.CharField(max_length=16, choices=DomainType)
    reception = models.OneToOneField(Reception, on_delete=models.PROTECT, null=True, blank=True)
    program = models.OneToOneField(Program, on_delete=models.PROTECT, null=True, blank=True)
    lab = models.OneToOneField(Lab, on_delete=models.PROTECT, null=True, blank=True)

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
    
    def get_instance_model(self):
        match self.domain_type:
            case DOMAINTYPE.RECEPTION:
                return self.reception
            
            case DOMAINTYPE.LAB:
                return self.lab 
            
            case DOMAINTYPE.PROGRAM:
                return self.program 

    def __str__(self):
        match self.domain_type:
            case DOMAINTYPE.RECEPTION:
                return "Reception Owner"
            
            case DOMAINTYPE.LAB:
                return f"Lab Owner | {self.lab.name}"
            
            case DOMAINTYPE.PROGRAM:
                return f"Program Owner | {self.program.name}"
            
            case _:
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

# These are what ensure each Program and Lab have an Owner
@receiver(post_save, sender=Lab)
def create_owner_on_lab_save(sender, instance, created, **kwargs):
    if created:
        Owner.objects.create(domain_type=DOMAINTYPE.LAB, lab=instance)

@receiver(post_save, sender=Program)
def create_owner_on_lab_save(sender, instance, created, **kwargs):
    if created:
        Owner.objects.create(domain_type=DOMAINTYPE.PROGRAM, program=instance)

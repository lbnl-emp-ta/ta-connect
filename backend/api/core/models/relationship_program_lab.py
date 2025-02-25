from django.db import models

class RelationshipProgramLab(models.Model):
    program = models.ForeignKey('core.Program', on_delete=models.CASCADE)
    lab = models.ForeignKey('core.Lab', on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['program', 'lab'], name='unique_program_lab')
        ]

    def __str__(self):
        return self.pk 
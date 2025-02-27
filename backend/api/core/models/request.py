from django.db import models

class Request(models.Model):
    status = models.ForeignKey('core.RequestStatus', on_delete=models.PROTECT)
    description = models.TextField()
    date_submitted = models.DateField(auto_now_add=True)
    projected_start_date = models.DateField(blank=True, null=True)
    projected_end_date = models.DateField(blank=True, null=True)
    completion_date = models.DateField(blank=True, null=True)
    statement_of_work_date = models.DateField(blank=True, null=True)

    depth = models.ForeignKey('core.Depth', blank=True, null=True, on_delete=models.PROTECT)
    sectors = models.ManyToManyField('core.Sector')
    topics = models.ManyToManyField('core.Topic')

    # used to determine where Request is coming from and who to give completion credit to
    crediting_program = models.ForeignKey('core.Program', on_delete=models.PROTECT)
    crediting_lab = models.ForeignKey('core.Lab', on_delete=models.PROTECT)
    crediting_team = models.ForeignKey('core.Team', on_delete=models.PROTECT)

    def __str__(self):
        return self.pk
    
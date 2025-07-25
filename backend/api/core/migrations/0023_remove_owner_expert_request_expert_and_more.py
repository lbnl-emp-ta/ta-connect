# Generated by Django 5.1.6 on 2025-06-05 13:36

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0022_expertise'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='owner',
            name='expert',
        ),
        migrations.AddField(
            model_name='request',
            name='expert',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='owner',
            name='domain_type',
            field=models.CharField(choices=[('reception', 'Reception'), ('program', 'Program'), ('lab', 'Lab')], max_length=16),
        ),
    ]

# Generated by Django 5.2 on 2025-05-15 16:28

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0008_alter_request_owner'),
    ]

    operations = [
        migrations.AlterField(
            model_name='owner',
            name='expert',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL, unique=True),
        ),
        migrations.AlterField(
            model_name='owner',
            name='lab',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to='core.lab', unique=True),
        ),
        migrations.AlterField(
            model_name='owner',
            name='program',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to='core.program', unique=True),
        ),
        migrations.AlterField(
            model_name='owner',
            name='reception',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to='core.reception', unique=True),
        ),
    ]

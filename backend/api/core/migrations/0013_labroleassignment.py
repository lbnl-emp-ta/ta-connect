# Generated by Django 5.2 on 2025-05-23 16:37

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0012_systemroleassignment'),
    ]

    operations = [
        migrations.CreateModel(
            name='LabRoleAssignment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('Lab', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='core.lab')),
                ('program', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to='core.program')),
                ('role', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='core.role')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'lab_role_assignment',
            },
        ),
    ]

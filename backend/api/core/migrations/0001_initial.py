# Generated by Django 5.2 on 2025-04-15 12:46

import core.models.request_status
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='CustomerType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=128, unique=True)),
                ('description', models.TextField()),
            ],
            options={
                'db_table': 'customer_type',
            },
        ),
        migrations.CreateModel(
            name='Depth',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, unique=True)),
                ('description', models.TextField()),
            ],
            options={
                'db_table': 'depth',
            },
        ),
        migrations.CreateModel(
            name='Organization',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=256, unique=True)),
                ('address', models.TextField()),
            ],
            options={
                'db_table': 'organization',
            },
        ),
        migrations.CreateModel(
            name='OrganizationType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512, unique=True)),
                ('description', models.TextField()),
            ],
            options={
                'db_table': 'organization_type',
            },
        ),
        migrations.CreateModel(
            name='RequestStatus',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, unique=True)),
                ('description', models.TextField()),
            ],
            options={
                'verbose_name': 'request status',
                'verbose_name_plural': 'request statuses',
                'db_table': 'request_status',
            },
        ),
        migrations.CreateModel(
            name='State',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=32, unique=True)),
                ('abbreviation', models.SlugField(unique=True)),
            ],
            options={
                'db_table': 'state',
            },
        ),
        migrations.CreateModel(
            name='TransmissionPlanningRegion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=256)),
            ],
            options={
                'db_table': 'transmission_planning_region',
            },
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('name', models.CharField(blank=True, max_length=254, null=True)),
                ('is_staff', models.BooleanField(default=False)),
                ('is_superuser', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('last_login', models.DateTimeField(blank=True, null=True)),
                ('date_joined', models.DateTimeField(auto_now_add=True)),
                ('phone', models.CharField(max_length=64)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Customer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(max_length=256, unique=True)),
                ('name', models.CharField(max_length=256)),
                ('phone', models.CharField(default=None, max_length=64, verbose_name='phone number')),
                ('title', models.CharField(max_length=256, verbose_name='job title')),
                ('org', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='core.organization', verbose_name='organization')),
            ],
            options={
                'db_table': 'customer',
            },
        ),
        migrations.AddField(
            model_name='organization',
            name='type',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='core.organizationtype'),
        ),
        migrations.CreateModel(
            name='Request',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('description', models.TextField()),
                ('date_created', models.DateTimeField(auto_now_add=True)),
                ('proj_start_date', models.DateField(blank=True, null=True, verbose_name='projected start date')),
                ('proj_completion_date', models.DateField(blank=True, null=True, verbose_name='projected completion date')),
                ('actual_completion_date', models.DateField(blank=True, null=True)),
                ('depth', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='core.depth')),
                ('status', models.ForeignKey(default=core.models.request_status.RequestStatus.get_default_pk, on_delete=django.db.models.deletion.PROTECT, to='core.requeststatus')),
            ],
            options={
                'db_table': 'request',
            },
        ),
        migrations.CreateModel(
            name='CustomerRequestRelationship',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('customer', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='core.customer')),
                ('customer_type', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='core.customertype')),
                ('request', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='core.request')),
            ],
            options={
                'db_table': 'customer_request_relationship',
            },
        ),
        migrations.AddField(
            model_name='customer',
            name='requests',
            field=models.ManyToManyField(related_name='customers', through='core.CustomerRequestRelationship', to='core.request'),
        ),
        migrations.CreateModel(
            name='Cohort',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=256)),
                ('description', models.TextField()),
                ('customers', models.ManyToManyField(blank=True, related_name='cohort', to='core.customer')),
                ('request', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='core.request')),
            ],
            options={
                'db_table': 'cohort',
            },
        ),
        migrations.AddField(
            model_name='customer',
            name='state',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='core.state'),
        ),
        migrations.AddField(
            model_name='customer',
            name='tpr',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='core.transmissionplanningregion', verbose_name='transmission planning region'),
        ),
        migrations.AddConstraint(
            model_name='customerrequestrelationship',
            constraint=models.UniqueConstraint(fields=('customer', 'request'), name='unique_customer_request'),
        ),
        migrations.AddConstraint(
            model_name='request',
            constraint=models.CheckConstraint(condition=models.Q(('proj_completion_date__gt', models.F('proj_start_date')), ('proj_start_date__isnull', True), _connector='OR'), name='projected_completion_date_after_projected_start_date_or_null', violation_error_message='The projected completion date must be after the projected start date'),
        ),
        migrations.AddConstraint(
            model_name='request',
            constraint=models.CheckConstraint(condition=models.Q(('proj_start_date__lt', models.F('proj_completion_date')), ('proj_completion_date__isnull', True), _connector='OR'), name='projected_start_date_before_projected_completion_date_or_null', violation_error_message='The projected start date must be before the projected completion date'),
        ),
    ]

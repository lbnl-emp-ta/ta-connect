# Generated by Django 5.1.6 on 2025-03-11 19:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0016_customer'),
    ]

    operations = [
        migrations.CreateModel(
            name='CustomerType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=128)),
                ('description', models.TextField()),
            ],
            options={
                'db_table': 'customer_type',
            },
        ),
    ]

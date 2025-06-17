from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from core.models import *

admin.site.unregister(Group)

admin.site.register(get_user_model())
admin.site.register(Request)
admin.site.register(Customer)
admin.site.register(CustomerRequestRelationship)
admin.site.register(Organization)
admin.site.register(OrganizationType)
admin.site.register(Program)
admin.site.register(Lab)
admin.site.register(Reception)
admin.site.register(Owner)
from django.contrib import admin
from django.contrib.auth.models import Group
from core.models import Request, RequestStatus 

admin.site.unregister(Group)

admin.site.register(Request)
admin.site.register(RequestStatus)
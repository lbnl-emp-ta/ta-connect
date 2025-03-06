from rest_framework import generics
from core.serializers import RequestSerializer
from core.models import Request


class RequestCreateView(generics.CreateAPIView):
    queryset = Request.objects.all()
    serializer_class = RequestSerializer
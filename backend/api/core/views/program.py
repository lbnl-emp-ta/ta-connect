from rest_framework.generics import ListAPIView

from core.models import *
from core.serializers import ProgramSerializer


class ProgramListView(ListAPIView):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer

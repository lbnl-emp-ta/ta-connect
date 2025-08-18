from rest_framework.generics import ListAPIView
from core.models import State
from core.serializers import StateSerializer


class StateListView(ListAPIView):
    queryset = State.objects.all().order_by("name")
    serializer_class = StateSerializer
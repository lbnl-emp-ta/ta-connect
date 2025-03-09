from rest_framework.generics import ListAPIView, RetrieveAPIView
from core.models import State
from core.serializers import StateSerializer


class StateListView(ListAPIView):
    queryset = State.objects.all()
    serializer_class = StateSerializer
    
class StateRetrieveView(RetrieveAPIView):
    queryset = State.objects.all()
    serializer_class = StateSerializer
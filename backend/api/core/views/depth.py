from rest_framework.generics import ListAPIView, RetrieveAPIView
from core.models import Depth
from core.serializers import DepthSerializer


class DepthListView(ListAPIView):
    queryset = Depth.objects.all()
    serializer_class = DepthSerializer
    
class DepthRetrieveView(RetrieveAPIView):
    queryset = Depth.objects.all()
    serializer_class = DepthSerializer
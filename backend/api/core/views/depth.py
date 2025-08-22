from rest_framework.generics import ListAPIView
from core.models import Depth
from core.serializers import DepthSerializer


class DepthListView(ListAPIView):
    queryset = Depth.objects.all()
    serializer_class = DepthSerializer
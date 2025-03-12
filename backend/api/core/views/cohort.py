from rest_framework import generics

from core.models import Cohort
from core.serializers import CohortSerializer

class CohortCreateView(generics.CreateAPIView):
    queryset = Cohort.objects.all()
    serializer_class = CohortSerializer
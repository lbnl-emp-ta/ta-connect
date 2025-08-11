from rest_framework import authentication, permissions
from rest_framework.generics import ListAPIView

from core.models import Topic
from core.serializers import TopicSerializer

from allauth.headless.contrib.rest_framework.authentication import (
    XSessionTokenAuthentication,
)

class TopicListView(ListAPIView):
    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]
    
    permission_classes = [
        permissions.IsAuthenticated,
    ]
    
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    
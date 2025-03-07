from rest_framework import generics, status
from rest_framework.response import Response
from core.serializers import RequestSerializer
from core.models import Request


class RequestCreateView(generics.CreateAPIView):
    queryset = Request.objects.all()
    serializer_class = RequestSerializer

    
    def post(self, request):
        imcoming_fields_to_keep = ["description"]
        incoming_data = request.data.copy()
        
        # Filter incoming fields
        for field in request.data:
            if field not in imcoming_fields_to_keep:
                incoming_data.pop(field)
        
        # ** From source code of CreateModelMixin **
        serializer = self.get_serializer(data=incoming_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        # ****
        
        outgoing_fields_to_keep = ["description", "date_created"]
        outgoing_data = serializer.data.copy()
        
        # Filter outgoing fields
        for field in serializer.data:
            if field not in outgoing_fields_to_keep:
                outgoing_data.pop(field)
                
        return Response(outgoing_data, status=status.HTTP_201_CREATED, headers=headers)
    

        
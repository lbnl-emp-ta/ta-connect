from rest_framework import views, authentication, permissions, status
from rest_framework.response import Response

from core.models import * 
from core.serializers import UserLeanSerializer
from core.permissions import *

from allauth.headless.contrib.rest_framework.authentication import (
    XSessionTokenAuthentication,
)

class UserEditView(views.APIView):
    queryset = User.objects.all()
    serializer_class = UserLeanSerializer

    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated
    ]
    
    def patch(self, request, user_id):
        try:
            user_obj = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response(data={"message":"User with given ID does not exist"})

        print("Request user:", request.user.pk)
        if request.user.pk != user_id:
            return Response(
                data={"message": "You do not have permission to edit this user"},
                status=status.HTTP_403_FORBIDDEN
            )

        user_patch_data = dict() 
        
        if not request.data:
            return Response(data={"message": "Missing request body"}, status=status.HTTP_204_NO_CONTENT)
        
        if "name" in request.data and (request.data.get("name") is not None):
            user_patch_data["name"] = request.data.get("name")
        
        if "email" in request.data and (request.data.get("email") is not None):
            user_patch_data["email"] = request.data.get("email")

        if "phone" in request.data and (request.data.get("phone") is not None):
            user_patch_data["phone"] = request.data.get("phone")
        
        serializer = UserLeanSerializer(user_obj, data=user_patch_data, partial=True)
        if serializer.is_valid():
            serializer.save()  # signal handles account_emailaddress sync
        else:
            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response(data=UserLeanSerializer(User.objects.get(pk=user_id)).data, status=status.HTTP_200_OK)
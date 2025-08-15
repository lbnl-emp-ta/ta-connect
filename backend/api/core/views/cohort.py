from rest_framework import generics, authentication, permissions
from django.db import IntegrityError
from rest_framework import generics, views, response, status

from core.models import Cohort, Customer
from core.serializers import CohortSerializer
from core.permissions import IsAdmin, IsCoordinator, IsProgramLead

from allauth.headless.contrib.rest_framework.authentication import (
    XSessionTokenAuthentication,
)

class CohortCreateView(generics.CreateAPIView):
    queryset = Cohort.objects.all()
    serializer_class = CohortSerializer

    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
        IsAdmin|IsCoordinator|IsProgramLead
    ]


class CohortAddCustomerView(views.APIView):
    """
    Add a Customer to a Cohort.
    """

    authentication_classes = [
        authentication.SessionAuthentication,
        XSessionTokenAuthentication,
    ]

    permission_classes = [
        permissions.IsAuthenticated,
        IsAdmin|IsCoordinator|IsProgramLead
    ]
        
    def post(self, request):
        if not request.data.get("cohort"):
            return response.Response({"cohort": ["Missing cohort field."]}, status=status.HTTP_400_BAD_REQUEST)
        
        if not request.data.get("customer"):
            return response.Response({"customer": ["Missing customer field."]}, status=status.HTTP_400_BAD_REQUEST)
        
        cohort_pk = request.data.get("cohort")
        customer_pk = request.data.get("customer")
        
        if not Cohort.objects.filter(pk=cohort_pk).exists():
            return response.Response({"cohort": [f"Cohort with pk={cohort_pk} does not exist!"]}, status=status.HTTP_400_BAD_REQUEST)
        
        if not Customer.objects.filter(pk=customer_pk).exists():
            return response.Response({"customer": [f"Customer with pk={customer_pk} does not exist!"]}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            Cohort.objects.get(pk=cohort_pk).customers.add(Customer.objects.get(pk=customer_pk))
        except IntegrityError as ex:
            return response.Response({"message": ex.__str__()}, status=status.HTTP_400_BAD_REQUEST)
        
        return response.Response({"message": "Customer was successfully add to the Cohort!"}, status=status.HTTP_201_CREATED)
        
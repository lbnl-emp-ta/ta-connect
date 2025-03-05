import datetime

from rest_framework.test import APITestCase
from core.models import Request
from django.db.utils import IntegrityError

class RequestModelTests(APITestCase):
    def test_proj_start_date_in_past(self):
        """
        The projected start date of a Request should not be
        in the past.
        """
        
        yesterday = datetime.date.today() + datetime.timedelta(days=-1)
        
        with self.assertRaises(IntegrityError):
            Request.objects.create(
                description="test", 
                proj_start_date=yesterday
            )
            
    def test_proj_completion_date_in_past(self):
        """
        The projected start date of a Request should not be
        in the past.
        """
        
        yesterday = datetime.date.today() + datetime.timedelta(days=-1)
        
        with self.assertRaises(IntegrityError):
            Request.objects.create(
                description="test", 
                proj_completion_date=yesterday
            )
            
    def test_proj_start_date_after_proj_completion_date(self):
        """
        The projected start date should be before the projected 
        completion date.
        """
        
        completion_date = datetime.date.today()
        start_date = completion_date + datetime.timedelta(days=1)
        
        request = Request(
            description="test",
            proj_completion_date=completion_date
        )
        
        request.proj_start_date = start_date
        
        with self.assertRaises(IntegrityError): 
            request.save()
            
    def test_proj_completion_date_before_start_date(self):
        """
        The projected completion date should be after the 
        projected start date.
        """
        
        completion_date = datetime.date.today()
        start_date = completion_date + datetime.timedelta(days=1)
        
        request = Request(
            description="test",
            proj_start_date=start_date
        )
        
        request.proj_completion_date = completion_date
        
        with self.assertRaises(IntegrityError): 
            request.save()
            
            
    def test_can_set_proj_start_date_if_proj_completion_date_null(self):
        """
        The projected start date can be set if any valid future date
        if the projected completion date has not been set.
        """
        
        arbitrary_future_date = datetime.date.today() + datetime.timedelta(days=7)
        
        did_not_raise_integrity_error = True
        
        try:
            Request.objects.create(
                description="test",
                proj_start_date=arbitrary_future_date, 
                proj_completion_date=None
            )
        except IntegrityError:
            did_not_raise_integrity_error = False
            
        self.assertTrue(did_not_raise_integrity_error)
        
    def test_can_set_proj_completion_date_if_proj_start_date_null(self):
        """
        The projected start date can be set if any valid future date
        if the projected completion date has not been set.
        """
        
        arbitrary_future_date = datetime.date.today() + datetime.timedelta(days=7)
        
        did_not_raise_integrity_error = True
        
        try:
            Request.objects.create(
                description="test",
                proj_start_date=None, 
                proj_completion_date=arbitrary_future_date
            )
        except IntegrityError:
            did_not_raise_integrity_error = False
            
        self.assertTrue(did_not_raise_integrity_error)

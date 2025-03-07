import datetime

from rest_framework.test import APITestCase
from rest_framework import serializers
from core.serializers import RequestSerializer

class RequestSerializerTest(APITestCase):
    def test_date_in_past_with_past_date(self):
        """
        Given a date in the past, date_in_past should return True.
        """
        
        past_date = datetime.date.today() + datetime.timedelta(days=-1)
        self.assertTrue(RequestSerializer.date_in_past(past_date))
        
    def test_date_in_past_with_future_date(self):
        """
        Given a date in the past, date_in_past should return False.
        """
        
        past_date = datetime.date.today() + datetime.timedelta(days=1)
        self.assertFalse(RequestSerializer.date_in_past(past_date))
        
    def test_validate_proj_start_date_with_past_date(self):
        """
        A start date in the past is not valid.
        """
        
        past_date = datetime.date.today() + datetime.timedelta(days=-1)
        with self.assertRaises(serializers.ValidationError):
            RequestSerializer.validate_proj_start_date(self=None, value=past_date)
            
        
    
    def test_validate_proj_start_date_with_future_date(self):
        """
        A start date in the future is valid.
        """
        
        future_date = datetime.date.today() + datetime.timedelta(days=1)
        raised_validation_error = False
    
        try:
            RequestSerializer.validate_proj_start_date(self=None, value=future_date)
        except serializers.ValidationError:
            raised_validation_error = True
        
        self.assertFalse(raised_validation_error)
    
    def test_validate_proj_completion_date_with_past_date(self):
        """
        A completion date in the past is not valid.
        """
        
        past_date = datetime.date.today() + datetime.timedelta(days=-1)
        with self.assertRaises(serializers.ValidationError):
            RequestSerializer.validate_proj_completion_date(self=None, value=past_date)
    
    def test_validate_proj_completion_date_with_future_date(self):
        """
        A completion date in the future is valid.
        """
        
        future_date = datetime.date.today() + datetime.timedelta(days=1)
        raised_validation_error = False
    
        try:
            RequestSerializer.validate_proj_completion_date(self=None, value=future_date)
        except serializers.ValidationError:
            raised_validation_error = True
        
        self.assertFalse(raised_validation_error)
    
    def test_validate_given_start_date_before_completion_date(self):
        """
        A completion date coming after the start date is valid.
        """
        
        start_date = datetime.date.today()
        completion_date = start_date + datetime.timedelta(days=1)
        
        raised_validation_error = False
        
        try:
            RequestSerializer.validate(
                self=None, 
                data={"proj_start_date":start_date, "proj_completion_date":completion_date}
            )
        except serializers.ValidationError:
            raised_validation_error = True
            
        self.assertFalse(raised_validation_error)
    
    def test_validate_given_start_date_after_completion_date(self):
        """
        A completion date coming before the start date is invalid.
        """
        start_date = datetime.date.today() + datetime.timedelta(days=1)
        completion_date = start_date + datetime.timedelta(days=-1)
        
        with self.assertRaises(serializers.ValidationError):
            RequestSerializer.validate(
                self=None, 
                data={"proj_start_date":start_date, "proj_completion_date":completion_date}
            )
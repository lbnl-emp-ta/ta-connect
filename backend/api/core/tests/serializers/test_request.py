import datetime
import pytest

from rest_framework import serializers
from core.serializers import RequestSerializer
from django.utils import timezone

class TestRequestSerializer():
    def test_date_in_past_is_true_with_past_date(self):
        """
        Given a date in the past, date_in_past should return True.
        """
        
        past_date = timezone.now().date() + datetime.timedelta(days=-1)
        assert RequestSerializer.date_in_past(past_date)
        
    def test_date_in_past_is_false_with_future_date(self):
        """
        Given a date in the past, date_in_past should return False.
        """
        
        future_date = timezone.now().date() + datetime.timedelta(days=1)
        assert not RequestSerializer.date_in_past(future_date)
        
    def test_validate_proj_start_date_raises_validation_error_given_past_date(self):
        """
        A start date in the past is not valid.
        """
        
        past_date = timezone.now().date() + datetime.timedelta(days=-1)
        with pytest.raises(serializers.ValidationError):
            RequestSerializer.validate_proj_start_date(self=None, value=past_date)
    
    def test_validate_proj_start_date_does_not_raise_validation_error_given_future_date(self):
        """
        A start date in the future is valid.
        """
        
        future_date = timezone.now().date() + datetime.timedelta(days=1)
        
        raised_validation_error = False
        try:
            RequestSerializer.validate_proj_start_date(self=None, value=future_date)
        except serializers.ValidationError:
            raised_validation_error = True
        
        assert not raised_validation_error
    
    def test_validate_proj_completion_date_raises_validation_error_given_past_date(self):
        """
        A completion date in the past is not valid.
        """
        
        past_date = timezone.now().date() + datetime.timedelta(days=-1)
        with pytest.raises(serializers.ValidationError):
            RequestSerializer.validate_proj_completion_date(self=None, value=past_date)
    
    def test_validate_proj_completion_date_does_not_raise_validation_error_with_future_date(self):
        """
        A completion date in the future is valid.
        """
        
        future_date = timezone.now().date() + datetime.timedelta(days=1)
        
        raised_validation_error = False
        try:
            RequestSerializer.validate_proj_completion_date(self=None, value=future_date)
        except serializers.ValidationError:
            raised_validation_error = True
        
        assert not raised_validation_error
    
    def test_validate_does_not_raise_validation_error_given_start_date_before_completion_date(self):
        """
        A completion date coming after the start date is valid.
        """
        
        start_date = timezone.now().date()
        completion_date = start_date + datetime.timedelta(days=1)
        
        raised_validation_error = False
        
        try:
            RequestSerializer.validate(
                self=None, 
                data={"proj_start_date":start_date, "proj_completion_date":completion_date}
            )
        except serializers.ValidationError:
            raised_validation_error = True
            
        assert not raised_validation_error
    
    def test_validate_raises_validation_error_given_start_date_after_completion_date(self):
        """
        A completion date coming before the start date is invalid.
        """
        start_date = timezone.now().date() + datetime.timedelta(days=1)
        completion_date = start_date + datetime.timedelta(days=-1)
        
        with pytest.raises(serializers.ValidationError):
            RequestSerializer.validate(
                self=None, 
                data={"proj_start_date":start_date, "proj_completion_date":completion_date}
            )
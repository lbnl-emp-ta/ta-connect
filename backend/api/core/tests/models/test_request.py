import datetime

from core.models import Request
from django.db.utils import IntegrityError
from django.utils import timezone
import pytest

@pytest.mark.django_db
class TestRequestModel():            
    def test_request_model_raises_integrity_error_when_proj_start_date_after_proj_completion_date(self):
        """
        The projected start date should be before the projected 
        completion date.
        """
        
        completion_date = timezone.now().date()
        start_date = completion_date + datetime.timedelta(days=1)
        
        request = Request(
            description="test",
            proj_completion_date=completion_date
        )
        
        request.proj_start_date = start_date
        
        with pytest.raises(IntegrityError): 
            request.save()
            
    def test_request_model_raises_integrity_error_when_proj_completion_date_before_proj_start_date(self):
        """
        The projected completion date should be after the 
        projected start date.
        """
        
        completion_date = timezone.now().date()
        start_date = completion_date + datetime.timedelta(days=1)
        
        request = Request(
            description="test",
            proj_start_date=start_date
        )
        
        request.proj_completion_date = completion_date
        
        with pytest.raises(IntegrityError): 
            request.save()
            
            
    def test_can_set_proj_start_date_if_proj_completion_date_null(self, test_depth):
        """
        The projected start date can be set if any valid future date
        if the projected completion date has not been set.
        """
        
        arbitrary_future_date = timezone.now().date() + datetime.timedelta(days=7)
        
        raised_validation_error = False
        
        try:
            Request.objects.create(
                description="test",
                depth=test_depth,
                proj_start_date=arbitrary_future_date, 
                proj_completion_date=None
            )
        except IntegrityError:
            raised_validation_error = True
            
        assert not raised_validation_error
        
    def test_can_set_proj_completion_date_if_proj_start_date_null(self, test_depth):
        """
        The projected start date can be set if any valid future date
        if the projected completion date has not been set.
        """
        
        arbitrary_future_date = timezone.now().date() + datetime.timedelta(days=7)
        
        raised_validation_error = False
        
        try:
            Request.objects.create(
                description="test",
                depth=test_depth,
                proj_start_date=None, 
                proj_completion_date=arbitrary_future_date
            )
        except IntegrityError:
            raised_validation_error = True
            
        assert not raised_validation_error

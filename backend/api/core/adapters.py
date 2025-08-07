from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.account.adapter import DefaultAccountAdapter
from allauth.headless.adapter import DefaultHeadlessAdapter
from core.models import User

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def populate_user(self, request, sociallogin, data):
        """
        Populates user information from social provider info.
        """
        user = super().populate_user(request, sociallogin, data)
        
        # Get the name from Google's extra_data
        if sociallogin.account.provider == 'google':
            extra_data = sociallogin.account.extra_data
            name = extra_data.get('name', '')
            if name:
                user.name = name
        
        return user
    
    def pre_social_login(self, request, sociallogin):
        """
        Invoked just after a user successfully authenticates via a
        social provider, but before the login is actually processed.
        """
        # Update existing user's name if it's empty
        if sociallogin.account.provider == 'google':
            try:
                user = User.objects.get(email=sociallogin.account.extra_data.get('email'))
                if not user.name:
                    user.name = sociallogin.account.extra_data.get('name', '')
                    user.save()
            except User.DoesNotExist:
                pass


class CustomAccountAdapter(DefaultAccountAdapter):
    def save_user(self, request, user, form, commit=True):
        """
        Saves a new `User` instance using information provided in the
        signup form.
        This may not actually be needed.
        """
        user = super().save_user(request, user, form, commit=False)
        
        # Handle any additional user fields here if needed
        if commit:
            user.save()
        return user
    
    
class CustomHeadlessAdapter(DefaultHeadlessAdapter):
    """
    Custom adapter for headless mode.
    This is a placeholder function to ensure the adapter is recognized.
    """
    def serialize_user(self, user):
        """
        Serializes the user object for headless mode.
        """
        ret = super().serialize_user(user)
        ret['name'] = user.name
        return ret
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.account.adapter import DefaultAccountAdapter
from allauth.headless.adapter import DefaultHeadlessAdapter
from allauth.socialaccount.models import EmailAddress
from core.models import User

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def populate_user(self, request, sociallogin, data):
        """
        Populates user information from social provider info.
        """
        user = super().populate_user(request, sociallogin, data)
        
        # Get the name from ORCID's extra_data
        if sociallogin.account.provider == 'orcid':
            extra_data = sociallogin.account.extra_data
            name_data = (extra_data.get('person') or {}).get('name') or {}
            given_names_obj = name_data.get('given-names') or {}
            family_name_obj = name_data.get('family-name') or {}
            given_names = given_names_obj.get('value', '') or ''
            family_name = family_name_obj.get('value', '') or ''
            name = f"{given_names} {family_name}"
            if name:
                user.name = name

        return user
    
    def pre_social_login(self, request, sociallogin):
        """
        Invoked just after a user successfully authenticates via a
        social provider, but before the login is actually processed.
        """
        if sociallogin.account.provider == 'orcid':
            # ORCID only returns an email if the user has made it public.
            # If no email is provided, generate a placeholder from the ORCID iD
            # so that allauth's EMAIL_REQUIRED check doesn't block signup.
            if not sociallogin.email_addresses:
                orcid_id = sociallogin.account.uid  # e.g. '0000-0002-1825-0097'
                placeholder_email = f"{orcid_id}@orcid.placeholder"
                sociallogin.user.email = placeholder_email
                sociallogin.email_addresses = [
                    EmailAddress(email=placeholder_email, verified=True, primary=True)
                ]

            # Update existing user's name if it's empty
            try:
                user = User.objects.get(email=sociallogin.user.email)
                extra_data = sociallogin.account.extra_data
                name_data = (extra_data.get('person') or {}).get('name') or {}
                given_names_obj = name_data.get('given-names') or {}
                family_name_obj = name_data.get('family-name') or {}
                given_names = given_names_obj.get('value', '') or ''
                family_name = family_name_obj.get('value', '') or ''
                name = f"{given_names} {family_name}"
                if name and (not user.name or user.name != name):
                    user.name = name
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
        ret['phone'] = user.phone
        return ret
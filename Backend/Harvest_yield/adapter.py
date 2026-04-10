from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.account.models import EmailAddress
from django.contrib.auth import get_user_model

User = get_user_model()

class MySocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        """
        Connects a social account to an existing user if the email matches.
        """
        # 1. If the social account is already connected, do nothing
        if sociallogin.is_existing:
            return

        # 2. Check if a user with this email already exists
        email = sociallogin.account.extra_data.get('email')
        if not email:
            return

        try:
            existing_user = User.objects.get(email=email)
            
            # 3. Connect the new social account to the existing user
            sociallogin.connect(request, existing_user)
            
            # 4. (Optional) Ensure the email is marked as verified
            # This prevents Allauth from asking for email confirmation again
            EmailAddress.objects.get_or_create(
                user=existing_user, 
                email=email, 
                defaults={'verified': True, 'primary': True}
            )
            
        except User.DoesNotExist:
            # If user doesn't exist, Allauth continues with normal signup
            pass
     #Redirect url   
    def get_login_redirect_url(self, request):
        """
        Forces the redirect to the React Frontend Dashboard 
        after a successful Google login.
        """
        return "http://localhost:5173/dashboard"
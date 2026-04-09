from django.db import models
from django.utils.timezone import now 
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.exceptions import ValidationError

# ==========================================
# SECTION 1: USER & HIERARCHY LOGIC
# ==========================================

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The email field is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password() 
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    ROLES = (
        ('admin', 'Admin'),
        ('farminstitution', 'Farm Institution'),
        ('farmhand', 'FarmHand'),
        ('farmcorrespondent', 'Farm Correspondent'),
        ('user', 'Standard User'),
    )
    username = None
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=50, choices=ROLES, default='user')
    institution_name = models.CharField(max_length=150, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)

    # --- Institutional Linking ---
    associated_institution = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, blank=True, 
        related_name='staff_members',
        limit_choices_to={'role': 'farminstitution'}
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    objects = UserManager()

    def __str__(self):
        return f"{self.email} ({self.role})"


# SECTION 2: STAFF PROFILE MODELS


class FarmHand(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='farmhand_profile',
        null=True, blank=True 
    )
    certification_number = models.CharField(max_length=100, blank=True, default="pending")
    
    def __str__(self):
        return f"Hand: {self.user.email if self.user else 'Unlinked'}"

class FarmCorrespondent(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='correspondent_profile',
        null=True, blank=True
    )
    region_assigned = models.CharField(max_length=200, blank=True)

# SECTION 3: FARM OPERATIONS
class Farm(models.Model):
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=300)
    gps_coordinates = models.CharField(max_length=50, blank=True)
    
   
    institution = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='managed_farms',
        limit_choices_to={'role': 'farminstitution'},
        null=True, blank=True
    )
    correspondent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='assigned_farms',
        limit_choices_to={'role': 'farmcorrespondent'},
        null=True, blank=True
    )
    farmhand = models.ForeignKey(
        FarmHand, 
        on_delete=models.SET_NULL, 
        null=True, blank=True,
        related_name='assigned_farms'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    @property
    def total_yield(self):
        """Calculates total kg produced by all FarmHands on this farm."""
        return self.farm_batches.aggregate(Sum('quantity_kg'))['quantity_kg__sum'] or 0

    @property
    def yield_performance(self):
        """
        Dynamically calculates a performance percentage.
        Logic: (Current Total Yield / Target Yield) * 100
        """
        target_yield = 1000  # This could be a field on the Farm model
        current = self.total_yield
        percentage = (current / target_yield) * 100
        return min(round(percentage, 1), 100) # Capped at 100%

    @property
    def recent_activity(self):
        """Fetches the last 3 batches entered by FarmHands."""
        return self.farm_batches.select_related('farmhand__user').order_by('-created_at')[:3]

class Batch(models.Model):
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='farm_batches', null=True, blank=True)
    farmhand = models.ForeignKey(FarmHand, on_delete=models.SET_NULL, null=True, blank=True)
    crop_name = models.CharField(max_length=150)
    variety = models.CharField(max_length=100, blank=True)
    planted_date = models.DateField(null=True, blank=True)
    harvest_date = models.DateField(null=True, blank=True)
    quantity_kg = models.DecimalField(max_digits=10, decimal_places=2)
    qr_generated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class TreatmentLog(models.Model):
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='treatment_logs')
    date = models.DateField(default=now)
    action_type = models.CharField(max_length=50)
    notes = models.TextField(blank=True)

# SECTION 4: SIGNALS

@receiver(post_save, sender=User)
def create_user_profiles(sender, instance, created, **kwargs):
    if created:
        if instance.role == 'farmhand':
            FarmHand.objects.get_or_create(user=instance)
        elif instance.role == 'farmcorrespondent':
            FarmCorrespondent.objects.get_or_create(user=instance)
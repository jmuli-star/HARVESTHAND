from django.db import models
from django.utils.timezone import now 
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from django.conf import settings
from django.db.models import Count, Q, Sum
from django.db.models.signals import post_save
from django.dispatch import receiver

# --- Manager Logic ---

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields): # Make password optional
        if not email:
            raise ValueError('The email field is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password() # Safe for Social Auth users
            
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True')
        
        return self.create_user(email, password, **extra_fields)

    def get_dashboard_stats(self):
        """One-hit query for Admin Dashboard"""
        return self.aggregate(
            total_users=Count('id'),
            admin_count=Count('id', filter=Q(role='admin')),
            farmhand_count=Count('id', filter=Q(role='farmhand')),
            correspondent_count=Count('id', filter=Q(role='farmcorrespondent')),
            institution_count=Count('id', filter=Q(role='farminstitution')),
            recent_growth=Count('id', filter=Q(date_joined__gte=now().date()))
        )

# --- Core User Model ---

class User(AbstractUser):
    ROLES = (
        ('admin', 'Admin'),
        ('farmhand', 'FarmHand'),
        ('farmcorrespondent', 'FarmCorrespondent'),
        ('farminstitution', 'FarmInstitution'),
        ('user', 'User'),
    )
    username = None
    email = models.EmailField(unique=True, blank=False, null=False)
    
    # Hierarchy Logic: Links staff to an Institution
    associated_institution = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='staff_members',
        limit_choices_to={'role': 'farminstitution'},
        help_text="The Institution this user works for."
    )
    
    role = models.CharField(max_length=50, choices=ROLES, default='user')
    institution_name = models.CharField(max_length=150, blank=True , null = True)
    
    # MOVED: Phone to User model so it's globally available for profile updates
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    objects = UserManager()

    def __str__(self):
        return f"{self.email} ({self.role})"

    # Role Helpers
    @property
    def is_institution_admin(self):
        return self.role == 'farminstitution'
    
    @property
    def is_farmhand(self):
        return self.role == 'farmhand'

    @property
    def is_admin_or_higher(self):
        return self.role == 'admin' or self.is_superuser
    
    @property
    def is_staff_member(self):
        """Returns True if the user belongs to an institution (FarmHand or Correspondent)"""
        return self.associated_institution is not None or self.role in ['farmhand', 'farmcorrespondent']


# --- Profile Models ---

class FarmHand(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='farmhand_profile', 
        null=True,
        blank=True
    )
    # Phone removed from here as it is now in User model
    certification_number = models.CharField(max_length=100, blank=True, default="pending")
    
    def __str__(self):
        return f"Hand: {self.user.email}"

# --- Operational Models ---

class Farm(models.Model):
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=300)
    gps_coordinates = models.CharField(max_length=50, blank=True)
    
    institution = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='managed_farms',
        limit_choices_to={'role': 'farminstitution'},
        null=True,
        blank=True
    )
    correspondent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='assigned_farms',
        limit_choices_to={'role': 'farmcorrespondent'},
        null=True,
        blank=True
    )
    farmhand = models.ForeignKey(
        FarmHand, 
        on_delete=models.CASCADE, 
        related_name='farms'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    @property
    def total_yield(self):
        return self.farm_batches.aggregate(total=Sum('quantity_kg'))['total'] or 0

class Batch(models.Model):
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='farm_batches', null=True, blank=True)
    farmhand = models.ForeignKey(FarmHand, on_delete=models.SET_NULL, null=True)
    crop_name = models.CharField(max_length=150)
    variety = models.CharField(max_length=100, blank=True)
    planted_date = models.DateField(null=True, blank=True)
    harvest_date = models.DateField(null=True, blank=True)
    quantity_kg = models.DecimalField(max_digits=10, decimal_places=2)
    destination = models.CharField(max_length=200, blank=True)
    qr_generated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "Batches"

    def __str__(self):
        return f"{self.crop_name} ({self.quantity_kg}kg)"

class TreatmentLog(models.Model):
    ACTIONS = [
        ('planting', 'Planting'),
        ('fertilizer', 'Organic Fertilizer'),
        ('pest_control', 'Organic Pest Control'),
        ('irrigation', 'Irrigation'),
        ('weeding', 'Manual Weeding'),
        ('harvest', 'Harvest'),
        ('packing', 'Packing'),
        ('transport', 'Transport'),
    ]
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='treatment_logs')
    date = models.DateField(default=now)
    action_type = models.CharField(max_length=50, choices=ACTIONS)
    product_used = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['date']

# --- Signals ---

@receiver(post_save, sender=User)
def manage_farmhand_profile(sender, instance, created, **kwargs):
    """Automatically create or update FarmHand profile safely"""
    if instance.role == 'farmhand':
        FarmHand.objects.get_or_create(user=instance)
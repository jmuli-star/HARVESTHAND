from django.db import models
from django.utils.timezone import now
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from django.conf import settings

# Create your models here.

class UserManager(BaseUserManager):
    def create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('The email field is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('super user must have is_staff true')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('super user must have is_super true')
        
        return self.create_user(email, password, **extra_fields)
    
class User(AbstractUser):
    ROLES = (
        ('admin','Admin',),
        ('farmhand','FarmHand'),
        ('farmcorrespondent','FarmCorrespondent'),
        ('farminstitution','FarmInstitution'),
        ('user','User'),
    )
    username = None
    email = models.EmailField(unique=True, blank = False , null = False)
    institution_name = models.CharField(max_length= 150, blank = True)
    institution_correspondent =models.CharField(max_length=150, blank = True)
    role = models.CharField(max_length=50 , choices=ROLES, default='user')
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS =[]
    objects = UserManager()
    
    def __str__(self):
        return self.email
    
    def is_farminstitution_or_higher(self):
        return self.role in['farminstitution','farmcorrespondent','farmhand','admin']
    
    def is_farmcorrespondent_or_higher(self):
        return self.role in['farmcorrespondent','farmhand','admin']
    
    def is_farmhand_or_higher(self):
        return self.role in['farmhand','admin']
    
    def is_admin_or_higher(self):
        return self.role == 'admin'

class FarmHand(models.Model):
    """One farmhand can manage multiple farms"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='farmhand', null = True, blank = True)
    phone = models.CharField(max_length=20, blank=True)
    certification_number = models.CharField(max_length=100, unique=True, help_text="EU Organic / USDA / JAS etc.")

    def __str__(self):
        if self.user:
            return f"{self.user.email}({self.certification_number})"
        return f"Unassigned profile ({self.certification_number})"
        

class Farm(models.Model):
    name = models.CharField(max_length=200)
    farmhand = models.ForeignKey(FarmHand, on_delete=models.CASCADE, related_name='farms')
    location = models.CharField(max_length=300)
    gps_coordinates = models.CharField(max_length=50, blank=True, help_text="e.g. 35.6762,139.6503")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Batch(models.Model):
    """Every harvest batch = unique UUID + QR"""
 
    farm = models.ForeignKey(Farm, on_delete=models.PROTECT, related_name='batches')
    crop_name = models.CharField(max_length=150, help_text="e.g. Heirloom Cherry Tomatoes")
    variety = models.CharField(max_length=100, blank=True)
    planted_date = models.DateField()
    harvest_date = models.DateField(null=True, blank=True)
    quantity_kg = models.DecimalField(max_digits=8, decimal_places=2)
    destination = models.CharField(max_length=200, blank=True, help_text="Restaurant name or Export buyer")
    qr_generated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.crop_name} , {self.farm} , {self.quantity_kg} , {self.destination}"


class TreatmentLog(models.Model):
    """Life story of the batch"""
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='treatment_logs')
    
    date = models.DateField(default=now)
    action_type = models.CharField(max_length=50, choices=[
        ('planting', 'Planting'),
        ('fertilizer', 'Organic Fertilizer'),
        ('pest_control', 'Organic Pest Control'),
        ('irrigation', 'Irrigation'),
        ('weeding', 'Manual Weeding'),
        ('harvest', 'Harvest'),
        ('packing', 'Packing'),
        ('transport', 'Transport'),
    ])
    product_used = models.CharField(max_length=200, blank=True, help_text="e.g. Compost Tea – 10L")
    notes = models.TextField(blank=True)
   

    class Meta:
        ordering = ['date']

    def __str__(self):
        return f"{self.action_type} on {self.date}"
    
    

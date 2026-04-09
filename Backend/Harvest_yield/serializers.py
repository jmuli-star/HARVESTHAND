from rest_framework import serializers
from django.conf import settings
from .models import User, FarmHand, Farm, Batch, TreatmentLog, FarmCorrespondent 
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.forms import PasswordResetForm
User = get_user_model()

# SYSTEM & AUTH SERIALIZERS
class DashboardStatsSerializer(serializers.Serializer):
    """Structures aggregated data from UserManager.get_dashboard_stats()"""
    total_users = serializers.IntegerField()
    admin_count = serializers.IntegerField()
    farmhand_count = serializers.IntegerField()
    correspondent_count = serializers.IntegerField()
    institution_count = serializers.IntegerField()
    recent_growth = serializers.IntegerField()

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Customizes the JWT response to include role and institution context."""
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['email'] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # --- ADDED: Include institution_id in response for frontend context ---
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'role': self.user.role,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'institution_id': self.user.associated_institution.id if self.user.associated_institution else None,
            'institution_name': self.user.institution_name if self.user.role == 'farminstitution' else None
        }
        return data
    
class RegisterSerializer(serializers.ModelSerializer):
    """Handles self-registration for standard users and institutions."""
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'password2', 'institution_name', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        if data.get('password') != data.get('password2'):
            raise serializers.ValidationError({'password': 'Passwords do not match'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        return User.objects.create_user(**validated_data)

#Password Reset Serializers ---

class PasswordResetSerializer(serializers.Serializer):
    """Handles the initial request for a password reset email."""
    email = serializers.EmailField()
    password_reset_form_class = PasswordResetForm

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            # Security Note: Often better to return success even if email doesn't exist
            # but for internal tools, a clear error is often preferred.
            raise serializers.ValidationError("No account found with this email.")
        return value

    def save(self):
        request = self.context.get('request')
        opts = {
            'use_https': request.is_secure(),
            'from_email': getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@harvesthand.com'),
            'request': request,
        }
        self.password_reset_form_class().save(**opts)

# SECTION 2: USER & PERSONNEL SERIALIZERS


class UserListSerializer(serializers.ModelSerializer):
    """Directory view of users, showing their hierarchy links."""
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'phone', 
            'institution_name', 'role', 'date_joined', 'associated_institution'
        ]
        read_only_fields = ['id', 'email', 'date_joined', 'role']

class FarmHandSerializer(serializers.ModelSerializer):
    """Profile details for FarmHands including their certification."""
    email = serializers.EmailField(source='user.email', read_only=True)
    full_name = serializers.SerializerMethodField()
    phone = serializers.CharField(source='user.phone', read_only=True)

    class Meta:
        model = FarmHand
        fields = ['id', 'email', 'full_name', 'phone', 'certification_number']

    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email.split('@')[0]
    
class InstitutionPersonnelSerializer(serializers.ModelSerializer):
    """
    Tailored for the 'Personnel' tab in the Institution Dashboard.
    Flattens data so the React table can 'draw' it easily.
    """
    full_name = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'role', 'status', 'phone']

    def get_full_name(self, obj):
        name = f"{obj.first_name} {obj.last_name}".strip()
        return name if name else obj.email.split('@')[0]

    def get_status(self, obj):
        # Logic: If they have logged a batch in the last 24 hours, they are 'Active'
        return "Active" if obj.is_active else "Inactive"

# --- ADDED: Serializer for FarmCorrespondent Profile ---
class FarmCorrespondentSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    class Meta:
        model = FarmCorrespondent
        fields = ['id', 'email', 'region_assigned']


# SECTION 3: OPERATIONAL SERIALIZERS


class FarmSerializer(serializers.ModelSerializer):
    """Links physical farms to the owners (institutions) and staff (hands/correspondents)."""
    farmhand_email = serializers.ReadOnlyField(source='farmhand.user.email')
    correspondent_email = serializers.ReadOnlyField(source='correspondent.email')
    institution_name = serializers.ReadOnlyField(source='institution.institution_name')
    # Use yield_index if you kept the @property in models, else remove this field
    yield_index = serializers.ReadOnlyField(source='total_yield', default=0)

    class Meta:
        model = Farm
        fields = [
            'id', 'name', 'location', 'gps_coordinates', 
            'institution', 'institution_name',
            'correspondent', 'correspondent_email', 
            'farmhand', 'farmhand_email', 
            'yield_index', 'created_at'
        ]
        read_only_fields = ['institution', 'created_at']

class BatchSerializer(serializers.ModelSerializer):
    """Harvest tracking linked back to a farm and specific hand."""
    farm_name = serializers.ReadOnlyField(source='farm.name')
    hand_email = serializers.ReadOnlyField(source='farmhand.user.email')

    class Meta:
        model = Batch
        fields = [
            'id', 'crop_name', 'variety', 'quantity_kg', 
            'farm', 'farm_name', 'farmhand', 'hand_email', 
            'planted_date', 'harvest_date', 'qr_generated', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class TreatmentLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = TreatmentLog
        fields = '__all__'

# SECTION 4: ADMINISTRATIVE & DEPLOYMENT

class AdminUserCreateSerializer(serializers.ModelSerializer):
    """Exclusive to Superadmins for creating new Admin accounts."""
    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['role'] = 'admin'
        return User.objects.create_superuser(**validated_data)

class InstitutionStaffCreateSerializer(serializers.ModelSerializer):
    """
    STRICT HIERARCHY: Used by FarmInstitutions to 'Hire' staff.
    Ensures the staff member is automatically linked to the institution.
    """
    class Meta:
        model = User
        fields = ['id', 'email', 'password', 'role', 'first_name', 'last_name', 'associated_institution']
        extra_kwargs = {'password': {'write_only': True}}
        
    def validate_role(self, value):
        # --- ADDED: Role Enforcement ---
        if value not in ['farmhand', 'farmcorrespondent']:
            raise serializers.ValidationError("Institutions can only deploy Farmhands or Correspondents.")
        return value

    def create(self, validated_data):
        # Default password if not provided in the frontend form
        password = validated_data.pop('password', 'Harvest@2026')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user
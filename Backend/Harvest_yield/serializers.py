from rest_framework import serializers
from .models import User, FarmHand, Farm, Batch, TreatmentLog
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

# --- 1. System & Auth Serializers ---

class DashboardStatsSerializer(serializers.Serializer):
    """Structures aggregated data from UserManager.get_dashboard_stats()"""
    total_users = serializers.IntegerField()
    admin_count = serializers.IntegerField()
    farmhand_count = serializers.IntegerField()
    correspondent_count = serializers.IntegerField()
    institution_count = serializers.IntegerField()
    recent_growth = serializers.IntegerField()

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT payload to include role and institution info for the frontend"""
    def validate(self, attrs):
        data = super().validate(attrs)
        data['role'] = self.user.role
        data['email'] = self.user.email
        data['id'] = self.user.id
        data['first_name'] = self.user.first_name
        data['last_name'] = self.user.last_name
        
        if self.user.associated_institution:
            data['institution_id'] = self.user.associated_institution.id
        return data

class RegisterSerializer(serializers.ModelSerializer):
    """Handles initial self-registration"""
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

# --- 2. User & Personnel Serializers ---

class UserListSerializer(serializers.ModelSerializer):
    """
    Main serializer for User Profiles. 
    Used for the Directory and the 'Settings' update.
    """
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'phone', 
            'institution_name', 'role', 'date_joined', 'associated_institution'
        ]
        # REMOVED: 'read_only_fields = fields' to allow PATCH updates
        read_only_fields = ['id', 'email', 'date_joined', 'role']

class FarmHandSerializer(serializers.ModelSerializer):
    """Profile details for FarmHands"""
    email = serializers.EmailField(source='user.email', read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = FarmHand
        fields = ['id', 'email', 'full_name', 'phone', 'certification_number']

    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email.split('@')[0]

# --- 3. Operational Serializers ---

class FarmSerializer(serializers.ModelSerializer):
    """Main serializer for the Institutional Dashboard Table"""
    farmhand_email = serializers.ReadOnlyField(source='farmhand.user.email')
    correspondent_email = serializers.ReadOnlyField(source='correspondent.email')
    institution_name = serializers.ReadOnlyField(source='institution.institution_name')
    yield_index = serializers.ReadOnlyField(source='total_yield')

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
    """Harvest data linked to farms and hands"""
    farm_name = serializers.ReadOnlyField(source='farm.name')
    hand_email = serializers.ReadOnlyField(source='farmhand.user.email')

    class Meta:
        model = Batch
        fields = [
            'id', 'crop_name', 'variety', 'quantity_kg', 'destination', 
            'farm', 'farm_name', 'farmhand', 'hand_email', 
            'planted_date', 'harvest_date', 'qr_generated', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class TreatmentLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = TreatmentLog
        fields = '__all__'

# --- 4. Administrative / Linkage Serializers ---

class InstitutionStaffCreateSerializer(serializers.ModelSerializer):
    """
    Used by Institutions to 'Deploy Personnel'.
    Automatically links new staff to the logged-in Institution.
    """
    password = serializers.CharField(write_only=True, min_length=8, required=False)

    class Meta:
        model = User
        fields = ['id', 'email', 'password', 'role', 'first_name', 'last_name', 'associated_institution']
        
    def validate_role(self, value):
        if value not in ['farmhand', 'farmcorrespondent']:
            raise serializers.ValidationError("Institutions can only deploy Farmhands or Correspondents.")
        return value

    def create(self, validated_data):
        if 'password' not in validated_data:
            validated_data['password'] = 'ChangeMe123!'
        return User.objects.create_user(**validated_data)
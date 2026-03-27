from rest_framework import serializers
from .models import User, FarmHand, Farm, Batch, TreatmentLog
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

# <--- ADDED: Specialized Serializer for Admin Dashboard Stats --->
class DashboardStatsSerializer(serializers.Serializer):
    """
    This serializer doesn't map to a single model; 
    it structures the aggregated data from our UserManager.
    """
    total_users = serializers.IntegerField()
    admin_count = serializers.IntegerField()
    farmhand_count = serializers.IntegerField()
    correspondent_count = serializers.IntegerField()
    institution_count = serializers.IntegerField()
    recent_growth = serializers.IntegerField()

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email' 

    def validate(self, attrs):
        data = super().validate(attrs)
        # Add custom claims to the JWT token response if needed
        data['role'] = self.user.role
        data['email'] = self.user.email
        return data

class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'password2', 'institution_name', 'institution_correspondent', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        if data.get('password') != data.get('password2'):
            raise serializers.ValidationError({'password': 'passwords do not match'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user
        
class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'institution_name', 'institution_correspondent', 'role', 'date_joined']
        read_only_fields = fields

class FarmHandSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = FarmHand
        fields = ['id', 'email', 'phone', 'certification_number']

class FarmSerializer(serializers.ModelSerializer):
    farmhand_details = serializers.ReadOnlyField(source='farmhand.user.email')

    class Meta:
        model = Farm
        fields = ['id', 'name', 'farmhand_details', 'location', 'gps_coordinates']

class TreatmentLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = TreatmentLog
        fields = ['id', 'batch', 'date', 'action_type', 'product_used', 'notes']
        
# Harvest_yield/serializers.py

class BatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = [
            'id', 'crop_name', 'quantity_kg', 'destination', 
            'farm', 'farmhand', 'created_at'
        ]
        # These are read-only because they are linked automatically by the backend
        read_only_fields = ['id', 'farm', 'farmhand', 'created_at']

class AdminUserCreateSerializer(serializers.ModelSerializer):
    # We add write_only to ensure the password is never sent back in a GET request
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['id', 'email', 'password', 'role']

    def create(self, validated_data):
        # Using the create_user method from your custom UserManager
        # to ensure the password gets hashed correctly!
        return User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'admin')
        )
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

class BatchSerializer(serializers.ModelSerializer):
    farm_name = serializers.ReadOnlyField(source='farm.name')
    treatment_logs = TreatmentLogSerializer(many=True, read_only=True)

    class Meta:
        model = Batch
        fields = [
            'id', 'farm_name', 'crop_name', 'variety', 
            'planted_date', 'harvest_date', 'quantity_kg', 
            'destination', 'qr_generated', 'created_at', 'treatment_logs'
        ]
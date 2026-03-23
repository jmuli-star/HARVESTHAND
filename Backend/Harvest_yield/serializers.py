from rest_framework import serializers
from .models import User, FarmHand, Farm, Batch, TreatmentLog
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


User = get_user_model()

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    # This tells the login system: "Use the 'email' key from JSON as the username"
    username_field = 'email' 

    def validate(self, attrs):
        # This ensures 'email' is passed to the authentication backend
        data = super().validate(attrs)
        return data

class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'password2', 'institution_name', 'institution_correspondent', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    # FIX: These methods must be aligned with 'class Meta', NOT inside it!
    def validate(self, data):
        if data.get('password') != data.get('password2'):
            raise serializers.ValidationError({'password': 'passwords do not match'})
        return data

    def create(self, validated_data):
        # Now this will actually run and remove password2
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user
        
class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # FIX: Changed to lowercase to match your models.py
        fields = ['id', 'email', 'institution_name', 'institution_correspondent', 'role']
        read_only_fields = fields

class FarmHandSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = FarmHand
        # FIX: Removed 'username' as it's not in your FarmHand model
        fields = ['email', 'phone', 'certification_number']

class FarmSerializer(serializers.ModelSerializer):
    # FIX: Corrected typo 'eamil' to 'email'
    farmhand_details = serializers.ReadOnlyField(source='farmhand.user.email')

    class Meta:
        model = Farm
        fields = ['id', 'name', 'farmhand_details', 'location']

class TreatmentLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = TreatmentLog
        fields = ['batch', 'date', 'action_type', 'product_used', 'notes']

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
from rest_framework import serializers
from .models import *

class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only =True)
    class Meta:
        model = User
        fields=['emial', 'password', 'password2','Institution_name','Institution_correspondent']
        extra_kwargs = {'password': {'write_only': True}}
        def validate(self,data):
            if data['password'] != data['password']:
                raise serializers.ValidationError({'password': 'password does not match'})
            return data
        def create(self,validated_data):
            validated_data.pop('password2')
            user =user.objects.create_user(
                email = validated_data['email'],
                password = validated_data['password'],
                Institution_name = validated_data.get('Institution_name'),
                Institution_correspondent = validated_data.get('Institution_correspondent')
                
            )
            return user
        
class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email','Institution_name','Institution_correspondent','role']
        read_only_fields = fields
        

class FarmHandSerializer(serializers.ModelSerializer):
    class Meta:
        model = FarmHand
        fields = [ 'username', 'phone', 'certification_number']


class FarmSerializer(serializers.ModelSerializer):
    farmhand_details = serializers.CharField(source='farmhand.__str__', read_only=True)
    class Meta:
        model = Farm
        fields = '__all__'
        read_only_fields = ['farmhand_details']


class TreatmentLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = TreatmentLog
        fields = [ 'batch', 'date', 'action_type', 'product_used', 'notes']


# class BatchSerializer(serializers.ModelSerializer):
#     farm_name = serializers.CharField(source='farm.__str__', many = True , readonly = True)

#     class Meta:
#         model = Batch
#         fields = [
#             'farm_name', 'crop_name', 'variety', 
#             'planted_date', 'harvest_date', 'quantity_kg', 
#             'destination', 'qr_generated', 'created_at'
#         ]
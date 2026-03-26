from rest_framework import serializers
from .models import *
from django.contrib.auth import get_user_model

User = get_user_model()

# --- 1. MINIMAL USER SERIALIZER (FOR DROPDOWNS) ---
class UserMinimalSerializer(serializers.ModelSerializer):
    """
    Logic: Used by the React frontend to populate 'Assign To' dropdowns.
    Only sends essential data to keep the payload light.
    """
    class Meta:
        model = User
        fields = ['id', 'email', 'role']


# --- 2. TASK SERIALIZER -
class TaskSerializer(serializers.ModelSerializer):
    """
    Logic: Enhanced to support 'Institution vs Local' UI filtering.
    """
    # Lookups for the 'Assigner' (Creator)
    creator_email = serializers.ReadOnlyField(source='creator.email')
    creator_name = serializers.ReadOnlyField(source='creator.first_name')
    creator_role = serializers.ReadOnlyField(source='creator.role')
    batch_name = serializers.ReadOnlyField(source='batch.crop_name') # Quick reference
    
    # Lookups for the 'Worker' (Recipient)
    assigned_to_email = serializers.ReadOnlyField(source='assigned_to.email')
    assigned_to_name = serializers.ReadOnlyField(source='assigned_to.first_name')
    assigned_to_role = serializers.ReadOnlyField(source='assigned_to.role')

    class Meta:
        model = Task
        fields = [
            'id', 
            'creator', 'creator_email', 'creator_name', 'creator_role',
            'assigned_to', 'assigned_to_email', 'assigned_to_name', 'assigned_to_role',
            'title', 'description', 'category', 'is_complete', 
            'created_at', 'updated_at', 'batch_name'
        ]
        # 'creator' is set in views.py perform_create()
        read_only_fields = ['creator', 'created_at', 'updated_at']


# --- 3. REPORT SERIALIZER ---
from rest_framework import serializers
from .models import Report, Batch # Ensure these are imported correctly
from django.contrib.auth import get_user_model

class ReportSerializer(serializers.ModelSerializer):
    """
    Logic: Link harvest batches to reports with null-safety checks.
    Uses PrimaryKeyRelatedField for the batch to ensure valid database linking.
    """
    # Exposing the batch relationship explicitly
    # allow_null=True ensures that if no batch is sent, it saves as None/Null
    batch = serializers.PrimaryKeyRelatedField(
        queryset=Batch.objects.all(), 
        allow_null=True, 
        required=False
    )

    # ReadOnlyFields to send descriptive batch info to the frontend
    # If self.batch is None, these will return None instead of crashing
    batch_crop = serializers.ReadOnlyField(source='batch.crop_name')
    batch_quantity = serializers.ReadOnlyField(source='batch.quantity_kg')
    batch_destination = serializers.ReadOnlyField(source='batch.destination')

    sender_email = serializers.ReadOnlyField(source='sender.email')
    sender_role = serializers.ReadOnlyField(source='sender.role')
    
    recipient_email = serializers.ReadOnlyField(source='recipient.email')
    recipient_role = serializers.ReadOnlyField(source='recipient.role')

    class Meta:
        model = Report
        fields = [
            'id', 
            'sender', 'sender_email', 'sender_role',
            'recipient', 'recipient_email', 'recipient_role',
            'batch', 'batch_crop', 'batch_quantity', 'batch_destination',
            'target_role', 'title', 'message', 
            'is_complete', 'feedback', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['sender', 'target_role', 'created_at', 'updated_at']

    def validate(self, data):
        """
        Logic: 
        1. Self-reporting check.
        2. Ensures batch exists if provided (handled by PrimaryKeyRelatedField).
        """
        request = self.context.get('request')
        recipient = data.get('recipient')
        
        # Bug fix: Ensure recipient is not None before comparing
        if request and recipient and request.user == recipient:
            raise serializers.ValidationError({"recipient": "You cannot send a report/task to yourself."})
            
        return data
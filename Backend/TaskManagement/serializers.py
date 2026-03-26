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
class ReportSerializer(serializers.ModelSerializer):
    """
    Logic: Handles complex multi-role feedback loops.
    Captures 'target_role' automatically to ensure the report context 
    is preserved even if a user's role changes in the future.
    """
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
            'target_role', 'title', 'message', 
            'is_complete', 'feedback', 
            'created_at', 'updated_at'
        ]
        # Logic: 'sender' and 'target_role' are handled by backend logic (Model .save())
        read_only_fields = ['sender', 'target_role', 'created_at', 'updated_at']

    def validate(self, data):
        """
        Logic: Optional workflow safety check.
        Ensures a user isn't sending a report to themselves.
        """
        if self.context['request'].user == data.get('recipient'):
            raise serializers.ValidationError("You cannot send a report/task to yourself.")
        return data
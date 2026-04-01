from rest_framework import serializers
from .models import Messages

class MessageSerializer(serializers.ModelSerializer):
    sender_email = serializers.EmailField(source='sender.email', read_only=True)

    class Meta:
        model = Messages
        fields = ['id', 'sender', 'sender_email', 'receiver', 'content', 'timestamp', 'is_read']
        read_only_fields = ['sender', 'timestamp']
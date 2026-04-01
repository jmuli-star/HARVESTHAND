from django.shortcuts import render
from rest_framework import viewsets, permissions
from django.db.models import Q
from .models import Messages
from .serializers import MessageSerializer

# Create your views here.

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Get messages between the logged-in user and a specific person (via query param)
        other_user_id = self.request.query_params.get('other_user_id')
        
        if other_user_id:
            return Messages.objects.filter(
                (Q(sender=user) & Q(receiver_id=other_user_id)) |
                (Q(sender_id=other_user_id) & Q(receiver=user))
            )
        # Otherwise return all messages involving the user
        return Messages.objects.filter(Q(sender=user) | Q(receiver=user))

    def perform_create(self, serializer):
        # Automatically set the sender as the logged-in user
        serializer.save(sender=self.request.user)


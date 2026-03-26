from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.auth import get_user_model

from .models import Task, Report
from .serializers import TaskSerializer, ReportSerializer, UserMinimalSerializer

User = get_user_model()

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Logic: Support UI 'source' filtering.
        """
        user = self.request.user
        source = self.request.query_params.get('source')

        if user.role in ['farminstitution', 'admin']:
            return Task.objects.all().order_by('-created_at')

        if source == 'institution' and user.role == 'farmcorrespondent':
            return Task.objects.filter(assigned_to=user).order_by('-created_at')
        
        return Task.objects.filter(
            Q(creator=user) | Q(assigned_to=user)
        ).distinct().order_by('-created_at')

    def perform_create(self, serializer):
        """
        BUG FIX / ENHANCEMENT: Automatically capture current user as creator.
        The frontend no longer needs to send a 'creator' ID in the POST body.
        """
        serializer.save(creator=self.request.user)

    @action(detail=False, methods=['get'])
    def assignable_users(self, request):
        """
        Logic: Restrict 'Select Staff' dropdown based on organizational hierarchy.
        """
        user = request.user
        
        if user.role == 'farminstitution':
            queryset = User.objects.filter(role='farmcorrespondent')
        elif user.role == 'farmcorrespondent':
            # Correspondents can assign tasks to Farmhands
            queryset = User.objects.filter(role='farmhand')
        elif user.role == 'farmhand':
            # Farmhands need to see Correspondents to send them Batch Reports
            queryset = User.objects.filter(role='farmcorrespondent')
        else:
            queryset = User.objects.none()

        serializer = UserMinimalSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def toggle_complete(self, request, pk=None):
        task = self.get_object()
        if request.user != task.assigned_to and request.user != task.creator:
            return Response({"detail": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
            
        task.is_complete = not task.is_complete
        task.save()
        return Response({'is_complete': task.is_complete, 'status': 'success'})


class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'farminstitution']:
            return Report.objects.all().order_by('-created_at')
        
        return Report.objects.filter(
            Q(sender=user) | Q(recipient=user)
        ).order_by('-created_at')

    def perform_create(self, serializer):
        """
        AUTOMATION LOGIC: Capture current user as the sender.
        Even if the frontend sends a 'sender' ID, this overrides it with 
        the authenticated user's ID for security and integrity.
        """
        serializer.save(sender=self.request.user)

    @action(detail=True, methods=['patch'])
    def add_feedback(self, request, pk=None):
        """
        Logic: Allows recipient (Correspondent) to reply to a report.
        """
        report = self.get_object()
        
        # Bug Fix: Ensure only the intended recipient can provide feedback
        if request.user != report.recipient:
            return Response({"detail": "Only the recipient can provide feedback"}, status=status.HTTP_403_FORBIDDEN)
            
        feedback_text = request.data.get('feedback')
        if not feedback_text:
            return Response({"detail": "Feedback text required"}, status=status.HTTP_400_BAD_REQUEST)
            
        report.feedback = feedback_text
        report.is_complete = True 
        report.save()
        return Response(ReportSerializer(report).data)
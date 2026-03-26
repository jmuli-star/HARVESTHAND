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
        - if ?source=institution: Return tasks where recipient is Correspondent.
        - default: Return tasks relevant to the user (sent or received).
        """
        user = self.request.user
        source = self.request.query_params.get('source')

        # 1. Admin/Institution visibility
        if user.role in ['farminstitution', 'admin']:
            return Task.objects.all().order_by('-created_at')

        # 2. Logic for 'Institution Orders' UI section
        if source == 'institution' and user.role == 'farmcorrespondent':
            # Returns tasks assigned TO the correspondent (usually from Institution)
            return Task.objects.filter(assigned_to=user).order_by('-created_at')
        
        # 3. Standard Dashboard View
        return Task.objects.filter(
            Q(creator=user) | Q(assigned_to=user)
        ).distinct().order_by('-created_at')

    def perform_create(self, serializer):
        # Automatically tag the sender as the 'creator'
        serializer.save(creator=self.request.user)

    @action(detail=False, methods=['get'])
    def assignable_users(self, request):
        """
        Logic: Restrict who can be seen in the 'Select Staff' dropdown.
        """
        user = request.user
        
        # Institution assigns to Correspondents
        if user.role == 'farminstitution':
            queryset = User.objects.filter(role='farmcorrespondent')
        # Correspondent assigns to Farmhands
        elif user.role == 'farmcorrespondent':
            queryset = User.objects.filter(role='farmhand')
        # Farmhands assign (usually reports) to Correspondents
        elif user.role == 'farmhand':
            queryset = User.objects.filter(role='farmcorrespondent')
        else:
            queryset = User.objects.none()

        serializer = UserMinimalSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def toggle_complete(self, request, pk=None):
        """
        Logic: The 'Tick Box' feature. 
        Note: Front-end uses this via PATCH to /api/v1/management/tasks/{id}/toggle_complete/
        """
        task = self.get_object()
        
        # Security: Only recipient can mark as done, or creator can undo/audit
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
        
        # Reports sent BY user or TO user
        return Report.objects.filter(
            Q(sender=user) | Q(recipient=user)
        ).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    @action(detail=True, methods=['patch'])
    def add_feedback(self, request, pk=None):
        """
        Logic: Allows Correspondent to reply to a Farmhand's report.
        """
        report = self.get_object()
        if request.user != report.recipient:
            return Response({"detail": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
            
        feedback_text = request.data.get('feedback')
        if not feedback_text:
            return Response({"detail": "Feedback text required"}, status=status.HTTP_400_BAD_REQUEST)
            
        report.feedback = feedback_text
        report.is_complete = True 
        report.save()
        return Response(ReportSerializer(report).data)
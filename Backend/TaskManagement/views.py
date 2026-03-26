from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.auth import get_user_model

# Import models from this app
from .models import Task, Report
# Import serializers from this app
from .serializers import TaskSerializer, ReportSerializer, UserMinimalSerializer

User = get_user_model()

class TaskViewSet(viewsets.ModelViewSet):
    """
    Logic: Handles Task assignment (Planting, Seedlings, etc.)
    Enforces hierarchy: Correspondent -> Farmhand -> User.
    """
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Logic: Filter tasks so users only see what is relevant to them.
        Institutions see everything; others see tasks they SENT or RECEIVED.
        """
        user = self.request.user
        if user.role == 'farminstitution' or user.role == 'admin':
            return Task.objects.all()
        
        return Task.objects.filter(
            Q(creator=user) | Q(assigned_to=user)
        ).order_by('-created_at')

    def perform_create(self, serializer):
        """
        Logic: Automatically set the 'creator' to the logged-in user.
        """
        serializer.save(creator=self.request.user)

    @action(detail=True, methods=['patch'])
    def toggle_complete(self, request, pk=None):
        """
        Logic: The 'Tick Box' feature. Allows the recipient to mark completion.
        """
        task = self.get_object()
        # Only the person assigned or the creator should toggle this
        if request.user != task.assigned_to and request.user != task.creator:
            return Response({"detail": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
            
        task.is_complete = not task.is_complete
        task.save()
        return Response({'is_complete': task.is_complete})

   
    # management/views.py

    @action(detail=False, methods=['get'])
    def assignable_users(self, request):
        user = request.user
        
        if user.role == 'farminstitution':
            queryset = User.objects.filter(role='farmcorrespondent')
        elif user.role == 'farmcorrespondent':
            queryset = User.objects.filter(role='farmhand')
        elif user.role == 'farmhand':
            # FIX: Allow Farmhands to report UP to Correspondents 
            # OR down to users. For reports, they need the Correspondent.
            queryset = User.objects.filter(role='farmcorrespondent') # Change 'user' to 'farmcorrespondent'
        else:
            queryset = User.objects.none()

        serializer = UserMinimalSerializer(queryset, many=True)
        return Response(serializer.data)
        
    


class ReportViewSet(viewsets.ModelViewSet):
    """
    Logic: Handles formal Reports and Feedback loops.
    Allows for bidirectional communication between roles.
    """
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Logic: Visibility rules for reports.
        """
        user = self.request.user
        if user.role in ['admin', 'farminstitution']:
            return Report.objects.all()
        
        return Report.objects.filter(
            Q(sender=user) | Q(recipient=user)
        ).order_by('-created_at')

    def perform_create(self, serializer):
        """
        Logic: Set sender to current user and ensure target_role is captured.
        """
        serializer.save(sender=self.request.user)

    @action(detail=True, methods=['patch'])
    def add_feedback(self, request, pk=None):
        """
        Logic: Allows the recipient to add notes/feedback to a report.
        """
        report = self.get_object()
        if request.user != report.recipient:
            return Response({"detail": "Only the recipient can provide feedback"}, status=status.HTTP_403_FORBIDDEN)
            
        feedback_text = request.data.get('feedback')
        if not feedback_text:
            return Response({"detail": "Feedback text required"}, status=status.HTTP_400_BAD_REQUEST)
            
        report.feedback = feedback_text
        report.is_complete = True # Automatically mark as complete when feedback is given
        report.save()
        return Response(ReportSerializer(report).data)



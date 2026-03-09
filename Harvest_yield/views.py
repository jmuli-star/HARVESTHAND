from django.shortcuts import render
from rest_framework import viewsets ,status
from django.db import models as django_models
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .models import *
from .serializers import *
from .permissions import *

# Create your views here.

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            from django.contrib.auth import get_user_model
            user = get_user_model().objects.get(email=request.data['email'])
            response.data['user'] = {
                'id': user.id,
                'email': user.email,
                'role': user.role,
            }
        return response
    
class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'Registration was successful',
                'user': {'id':user.id, 'email': user.email, 'role': user.role}
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class FarmViewSet(viewsets.ModelViewSet):
    queryset = Farm.objects.all()
    serializer_class = FarmSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        if self.action == 'create':
            return [IsOwnerOrReadOnly()]
        if self.action in ['update', 'partial_update']:
            return [IsFarmcorrespondentOrHigher()]
        if self.action == 'destory':
            return [IsAdmin()]
        return [IsAuthenticated()]
    
    # def get_queryset(self):
    #     user = self.request.user
    #     if not user.is_authenticated:
    #         return Farm.objects.filter(status= 'farms')
    #     if user.is_editor_or_higher():
    #         return Farm.objects.all()
    #     return Farm.objects.filter(
    #         django_models.Q(status='farms') | django_models.Q(author=user)
    #     ).order_by('-created_at') 
    
    # @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    # def like(self, request, pk=None):
    #     article = self.get_object()
    #     Like.objects.get_or_create(article=article, user=request.user) 
    #     return Response({'detail': 'Liked'})
      
    # @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    # def unlike(self, request, pk=None):
    #     article = self.get_object()
    #     Like.objects.filter(article=article, user=request.user).delete() 
    #     return Response({'detail': 'unLiked'})   

class UserRoleViewSet(viewsets.ViewSet):
    permission_classes = [IsAdmin]
    
    @action(detail=False, methods=['patch'], url_path='assign-role/(?P<user_id>\d+)/(?P<role>\w+)')
    def assign_role(self, request, user_id, role):
        if role not in dict(User.ROLES):
            return Response({"error": "Invalid role"}, status=400)
        
        try:
            target_user = User.objects.get(id=user_id)
            if target_user.is_superadmin() or target_user.is_superuser:
                return Response({"error": "Cannot modify superadmin"}, status=403)
            
            target_user.role = role
            target_user.save()
            return Response({"detail": f"Role updated to {role}"})
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

    @action(detail=False, methods=['delete'], url_path='delete-user/(?P<user_id>\d+)')
    def delete_user(self, request, user_id):
        if not request.user.is_superadmin():
            return Response({"error": "Only Super Admin"}, status=403)
        
        try:
            user = User.objects.get(id=user_id)
            if user.is_superuser:
                return Response({"error": "Cannot delete superuser"}, status=403)
            user.delete()
            return Response({"detail": "User deleted"})
        except User.DoesNotExist:
            return Response(status=404)

class UserListViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserListSerializer
    permission_classes = [IsAdmin]
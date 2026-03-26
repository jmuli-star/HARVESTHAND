from django.shortcuts import render
from rest_framework import viewsets ,status , generics, permissions
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

# Harvest_yield/views.py
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer # Import your new serializer

class AdminDashboardStatsView(APIView):
    """
    Logic to provide the 'Total Users' and role-based counts 
    to the Admin Dash cards in one single request.
    """
    permission_classes = [IsAdminUserRole] # Using Part 3 logic

    def get(self, request):
        # Calls the logic from the UserManager in Part 1
        stats = User.objects.get_dashboard_stats()
        # Serializes the dictionary using Part 2
        serializer = DashboardStatsSerializer(stats)
        return Response(serializer.data)
    
class CustomTokenObtainPairView(TokenObtainPairView):
    # Tell the view to use your email-based serializer
    serializer_class = MyTokenObtainPairSerializer

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
            return [IsAuthenticated()]
        if self.action in ['update', 'partial_update']:
            return [IsFarmcorrespondentOrHigher()]
        if self.action == 'destroy':
            return [IsAdminUserRole()]
        return [IsAuthenticated()]
    #Error correction on postman -POST
    def perform_create(self, serializer):
        farmhand_profile = FarmHand.objects.get_or_create(user = self.request.user)
        serializer.save(farmhand = farmhand_profile)
    
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Farm.objects.all()
        if user.is_farmcorrespondent_or_higher():
            return Farm.objects.all().order_by('-name')
        return Farm.objects.filter(farmhand__user = user).order_by('-name')
       
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        article = self.get_object()
        Like.objects.get_or_create(article=article, user=request.user) 
        return Response({'detail': 'Liked'})
      
    # @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    # def unlike(self, request, pk=None):
    #     article = self.get_object()
    #     Like.objects.filter(article=article, user=request.user).delete() 
    #     return Response({'detail': 'unLiked'})   

class UserRoleViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUserRole]
    
    @action(detail=False, methods=['patch'], url_path='assign-role/(?P<user_id>\d+)/(?P<role>\w+)')
    def assign_role(self, request, user_id, role):
        if role not in dict(User.ROLES):
            return Response({"error": "Invalid role"}, status=400)
        
        try:
            target_user = User.objects.get(id=user_id)
            if target_user.is_admin_or_higher(): 
                return Response({"error": "Cannot modif admin"})
               
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
    permission_classes = [IsAdminUserRole]

# Harvest_yield/views.py

class BatchListCreateView(generics.ListCreateAPIView):
    queryset = Batch.objects.all()
    serializer_class = BatchSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    # Harvest_yield/views.py
    # Harvest_yield/views.py

def perform_create(self, serializer):
    from .models import FarmHand, Farm
    
    # 1. Find the FarmHand profile for the logged-in user
    farmhand_profile = FarmHand.objects.filter(user=self.request.user).first()
    
    if not farmhand_profile:
        # If the user has no profile, the database will reject 'farm_id' as null.
        # We should raise a clear error for the frontend.
        from rest_framework.exceptions import ValidationError
        raise ValidationError({"detail": "You do not have a FarmHand profile assigned to you."})

    # 2. Find the Farm this hand works for
    # Adjust this filter based on how your Farm/FarmHand models are linked
    farm = Farm.objects.filter(farmhand=farmhand_profile).first()
    
    if not farm:
        from rest_framework.exceptions import ValidationError
        raise ValidationError({"detail": "You are not assigned to a specific Farm yet."})

    # 3. Save everything together
    # This ensures farm_id and farmhand_id are NOT null
    serializer.save(farmhand=farmhand_profile, farm=farm)

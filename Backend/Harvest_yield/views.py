from django.shortcuts import render , get_object_or_404 , redirect
from django.contrib.auth import get_user_model
from rest_framework import viewsets ,status , generics, permissions
from django.db import models as django_models
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import action , api_view , permission_classes , authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .models import *
from .serializers import *
from .permissions import *
from django.db.models import Sum, Avg, Count


# Create your views here.
#google auth
@api_view(['GET'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def social_token_exchange(request):
    user = request.user
    refresh = MyTokenObtainPairSerializer.get_token(user)
    
    # 1. Define your React Frontend URL
    # Use # (fragment) instead of ? (query) for better security with tokens
    frontend_url = "http://localhost:5173/#"
    # 2. Attach the tokens to the URL
    redirect_url = (
        f"{frontend_url}access={str(refresh.access_token)}"
        f"&refresh={str(refresh)}"
        f"&role={user.role}"
    )
    
    # 3. Send the user back to React!
    return redirect(redirect_url)

# Harvest_yield/views.py

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
    """
    Handles administrative overrides: Assigning roles and Deleting users.
    Targeted by: PATCH /api/v1/role-management/assign-role/<id>/<role>/
    """
    permission_classes = [IsAuthenticated, IsAdminUserRole]

    @action(detail=False, methods=['patch'], url_path=r'assign-role/(?P<user_id>\d+)/(?P<role>\w+)')
    def assign_role(self, request, user_id, role):
        if role not in dict(User.ROLES):
            return Response({"error": "Invalid role choice"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            target_user = User.objects.get(id=user_id)
            # Prevent downgrading other admins unless you are superuser
            if target_user.role == 'admin' and not request.user.is_superuser:
                return Response({"error": "Only Superadmins can modify Admin roles"}, status=403)
               
            target_user.role = role
            target_user.save()
            return Response({"detail": f"User {target_user.email} updated to {role}"})
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

    @action(detail=False, methods=['delete'], url_path=r'delete-user/(?P<user_id>\d+)')
    def delete_user(self, request, user_id):
        # Strict security check
        if not request.user.role == 'admin': 
            return Response({"error": "Unauthorized"}, status=403)
        
        try:
            user = User.objects.get(id=user_id)
            if user.is_superuser:
                return Response({"error": "Superusers cannot be deleted via API"}, status=403)
            user.delete()
            return Response({"detail": "User account removed successfully"}, status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

class UserListViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserListSerializer
    permission_classes = [permissions.IsAuthenticated]

# Harvest_yield/views.py

class BatchListCreateView(generics.ListCreateAPIView):
    queryset = Batch.objects.all()
    serializer_class = BatchSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    # Harvest_yield/views.py
    # Harvest_yield/views.py

def perform_create(self, serializer):
    from .models import FarmHand, Farm
    def perform_create(self, serializer):
        # 1. Get the FarmHand profile for the user trying to log the harvest
        try:
            farmhand_profile = FarmHand.objects.get(user=self.request.user)
        except FarmHand.DoesNotExist:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({
                "detail": "Your account is not linked to a FarmHand profile. Please contact an admin."
            })

        # 2. Get the Farm assigned to this FarmHand
        # Logic: We look for a farm where this farmhand is the manager
        farm = Farm.objects.filter(farmhand=farmhand_profile).first()

        if not farm:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({
                "detail": "You are a registered FarmHand, but you haven't been assigned to a Farm yet."
            })

        # 3. Save with the linked data (THIS IS THE CRITICAL STEP)
        serializer.save(
            farmhand=farmhand_profile, 
            farm=farm
        )
    
   

class AdminRegistrationView(APIView):
    # Logic: Only users with is_staff=True (Superusers/Admins) can access this
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        serializer = AdminUserCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"detail": "Administrator account provisioned successfully."}, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- PERMISSION CLASS ---
# class IsSystemAdmin(permissions.BasePermission):
#     """
#     Custom permission to only allow users with the custom role 'admin'.
#     """
#     def has_permission(self, request, view):
#         return bool(
#             request.user and 
#             request.user.is_authenticated and 
#             getattr(request.user, 'role', None) == 'admin'
#         )
class IsSystemAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        print("\n--- PERMISSION DEBUG ---")
        print(f"User: {request.user}")
        print(f"Is Authenticated: {request.user.is_authenticated}")
        
        if request.user.is_authenticated:
            role = getattr(request.user, 'role', 'NO ROLE ATTRIBUTE')
            print(f"Role found: {role}")
        else:
            print("Reason: User is Anonymous. Check JWT Settings or Headers.")
        
        print("------------------------\n")

        return bool(
            request.user and 
            request.user.is_authenticated and 
            getattr(request.user, 'role', None) == 'admin'
        )

# --- THE MODIFIED VIEW ---
class AdminDashboardStatsView(APIView):
    """
    Admin Dashboard: 
    - GET: Fetch statistics
    - POST: Provision new Admin
    - PATCH: Update existing user data
    - DELETE: Remove a user
    """
    permission_classes = [IsSystemAdmin]

    # 1. GET: Fetch Dashboard Stats
    def get(self, request):
        stats = User.objects.get_dashboard_stats()
        # If using a serializer: serializer = DashboardStatsSerializer(stats)
        # return Response(serializer.data)
        return Response(stats, status=status.HTTP_200_OK)

    # 2. POST: Provision / Create User (Admin only)
    def post(self, request):
        serializer = AdminUserCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"detail": "Administrator account provisioned successfully."}, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # 3. PATCH: Update specific user (Requires /<pk>/ in URL)
    def patch(self, request, pk=None):
        if not pk:
            return Response({"error": "User ID required for update"}, status=400)
            
        target_user = get_object_or_404(User, pk=pk)
        
        # partial=True allows updating only specific fields (like role or status)
        serializer = UserListSerializer(target_user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "User updated successfully", "user": serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # 4. DELETE: Remove user (Requires /<pk>/ in URL)
    def delete(self, request, pk=None):
        if not pk:
            return Response({"error": "User ID required for deletion"}, status=400)
            
        target_user = get_object_or_404(User, pk=pk)
        
        # Security: Prevent deleting self
        if target_user == request.user:
            return Response({"error": "You cannot delete your own admin account."}, status=400)
            
        target_user.delete()
        return Response({"detail": "User deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    from rest_framework import viewsets, status, permissions
 # Assuming you have a FarmSerializer

# --- 1. PERMISSION CLASS ---
class IsInstitutionUser(permissions.BasePermission):
    """
    Ensures only users with 'farminstitution' role can access these metrics.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'farminstitution'
        )

# --- 2. INSTITUTION STATS VIEW ---
class InstitutionStatsView(APIView):
    """
    Provides the 4 main card metrics for the Institution Dashboard.
    Logic: Filters everything by the logged-in Institution's ID.
    """
    permission_classes = [IsAuthenticated] # Using IsAuthenticated for initial testing

    def get(self, request):
        try:
            user = request.user
            
            # --- 1. Managed Farms ---
            # Counts farms where this user is the primary Institution
            managed_farms = Farm.objects.filter(institution=user)
            farms_count = managed_farms.count()

            # --- 2. Active Personnel (FIXED LOGIC) ---
            # We look for FarmHands who are assigned to any farm owned by this institution.
            # Using the related_name 'assigned_farms' defined in our models.py.
            active_personnel_count = FarmHand.objects.filter(
                assigned_farms__institution=user
            ).distinct().count()

            # --- 3. Yield Index (Aggregation) ---
            # Summing quantity_kg across all batches linked to this institution's farms
            total_yield_data = Batch.objects.filter(
                farm__institution=user
            ).aggregate(total=Sum('quantity_kg'))
            
            total_yield = total_yield_data['total'] or 0
            # Formatted string for the "Yield Performance" card
            yield_index_label = f"{total_yield:,} kg" 

            # --- 4. Pending Reports ---
            # Count batches where QR hasn't been generated yet
            pending_reports = Batch.objects.filter(
                farm__institution=user, 
                qr_generated=False
            ).count()

            stats_data = {
                "managed_farms_count": farms_count,
                "active_personnel": active_personnel_count,
                "avg_yield": yield_index_label,
                "pending_reports": pending_reports
            }
            
            return Response(stats_data, status=status.HTTP_200_OK)

        except Exception as e:
            # This will help you see the error in the console if it happens again
            print(f"Error in InstitutionStatsView: {str(e)}")
            return Response(
                {"error": "Internal Server Error", "details": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
# --- 3. INSTITUTION FARMS LIST VIEW ---
class InstitutionFarmListView(viewsets.ReadOnlyModelViewSet):
    """
    Provides the 'Managed Farm Status' table data.
    Logic: Only returns farms owned by the logged-in institution.
    """
    serializer_class = FarmSerializer
    permission_classes = [IsInstitutionUser]

    def get_queryset(self):
        # Only show farms where this user is the Institution owner
        return Farm.objects.filter(institution=self.request.user).select_related('farmhand__user', 'correspondent')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        # Customizing the response to match the Frontend Table exactly
        data = []
        for farm in queryset:
            # Logic: Determine status based on recent treatment logs or batch data
            # (Mocking 'Optimal' logic for now)
            status_label = "Optimal" 
            
            # Logic: Calculate yield per farm
            farm_yield = Batch.objects.filter(farm=farm).aggregate(Sum('quantity_kg'))['quantity_kg__sum'] or 0
            
            data.append({
                "id": farm.id,
                "name": farm.name,
                "lead_name": farm.correspondent.email if farm.correspondent else "Unassigned",
                "status": status_label,
                "yield_performance": int(farm_yield) # Returned as number for the % in frontend
            })
            
        return Response(data)

# --- 4. INSTITUTION NOTIFICATION VIEW ---
class InstitutionNotificationView(APIView):
    """
    Provides the 'Operational Intel' sidebar data.
    Since you're not using a full intelligence system, we generate 
    these based on recent Batch and FarmHand activity.
    """
    permission_classes = [IsInstitutionUser]

    def get(self, request):
        user = request.user
        # Logic: Get the 5 most recent batches created in this institution's network
        recent_batches = Batch.objects.filter(farm__institution=user).order_by('-created_at')[:5]
        
        notifications = []
        for batch in recent_batches:
            notifications.append({
                "message": f"New batch '{batch.crop_name}' recorded at {batch.farm.name}",
                "type": "info",
                "timestamp": batch.created_at.strftime("%I:%M %p")
            })
            
        return Response(notifications)
class UserProfileView(APIView):
    """
    Handles fetching and updating the logged-in user's profile details.
    Targeted by: /auth/user/ and /auth/user/update/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserListSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        # partial=True allows users to update only one field (e.g., just the institution)
        serializer = UserListSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
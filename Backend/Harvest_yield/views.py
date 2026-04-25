from django.shortcuts import render , get_object_or_404 , redirect
from django.conf import settings
from decouple import config
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode  ,urlsafe_base64_decode # Encodes the ID
from django.utils.encoding import force_bytes , force_str
from django.contrib.auth.tokens import default_token_generator
from rest_framework import viewsets ,status , generics, permissions
from django.db import models as django_models
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import action , api_view , permission_classes , authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.db.models import Sum, Avg, Count
from rest_framework.exceptions import ValidationError
from .models import *
from .serializers import *
from .permissions import *
from django.db.models import Sum, Avg, Count


# Create your views here.
class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token')
        GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID 

        try:
            # Verify the token
            idinfo = id_token.verify_oauth2_token(
                token, 
                google_requests.Request(), 
                GOOGLE_CLIENT_ID
            )

            email = idinfo['email']
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email, 
                    'first_name': idinfo.get('given_name', ''), 
                    'last_name': idinfo.get('family_name', ''),
                    'role': 'user'
                }
            )

            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'role': user.role
                }
            }, status=status.HTTP_200_OK)

        except ValueError:
            return Response({'error': 'Invalid Google Token'}, status=status.HTTP_400_BAD_REQUEST)
#google auth@api_view(['GET'])
@api_view(['GET'])
@permission_classes([AllowAny])
def social_token_exchange(request):
    """
    This view handles the hand-off from Google Session to React JWT.
    """
    if not request.user.is_authenticated:
        return redirect("http://localhost:5173/login?error=auth_failed")

    user = request.user
    refresh = RefreshToken.for_user(user)
    
    # Send tokens back to your React login page
    # Your Logintoogle.jsx useEffect will catch these
    frontend_url = "http://localhost:5173/login"
    
    redirect_url = (
        f"{frontend_url}?access={str(refresh.access_token)}"
        f"&refresh={str(refresh)}"
        f"&role={getattr(user, 'role', 'user')}"
    )
    
    return redirect(redirect_url)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user_after_social(request):
    """
    Optional 'Check-In' endpoint for React to verify the session 
    and get fresh tokens if the redirect fails.
    """
    user = request.user
    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'email': user.email,
            'role': user.role
        }
    })


class AdminDashboardStatsView(APIView):
    """
    Logic to provide the 'Total Users' and role-based counts 
    to the Admin Dash cards in one single request.
    """
    permission_classes = [IsAdminUserRole] 

    def get(self, request):
        # Calls the logic from the UserManager in Part 1
        stats = User.objects.get_dashboard_stats()
        # Serializes the dictionary using Part 2
        serializer = DashboardStatsSerializer(stats)
        return Response(serializer.data)
    
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        # 1. Let SimpleJWT handle the 401/400 validation first
        try:
            response = super().post(request, *args, **kwargs)
        except Exception as e:
            # If SimpleJWT fails, it returns the error automatically
            return Response({"detail": str(e)}, status=400)

        if response.status_code == 200:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
            # 2. Use .get() safely
            email_input = request.data.get('email') or request.data.get('username')
            try:
                user = User.objects.get(email=email_input)
                response.data['user'] = {
                    'id': user.id,
                    'email': user.email,
                    'role': getattr(user, 'role', 'user'),
                }
            except User.DoesNotExist:
                return Response({"detail": "User record found in auth but not in database."}, status=404)
        
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
    
    def perform_create(self, serializer):
        try:
            farmhand_profile = FarmHand.objects.get(user=self.request.user)
        except FarmHand.DoesNotExist:
            raise ValidationError({"detail": "No FarmHand profile found for this account."})

        farm = Farm.objects.filter(farmhand=farmhand_profile).first()
        if not farm:
            raise ValidationError({"detail": "You haven't been assigned to a Farm yet."})

        serializer.save(farmhand=farmhand_profile, farm=farm)
   

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
    Main metrics for Institution Dashboard.
    Draws dynamic data from FarmHand batch entries.
    """
    permission_classes = [IsAuthenticated] 

    def get(self, request):
        user = request.user
        managed_farms = Farm.objects.filter(institution=user)
        
        # 1. Managed Farms Count
        farms_count = managed_farms.count()

        # 2. Dynamic Personnel Count (Everyone linked to this Institution)
        staff_count = User.objects.filter(associated_institution=user).count()

        # 3. Dynamic Yield Index (Live sum of all FarmHand batches on Institution farms)
        total_yield = Batch.objects.filter(farm__institution=user).aggregate(total=Sum('quantity_kg'))['total'] or 0
        
        # 4. Pending Reports (Batches without QR codes)
        pending = Batch.objects.filter(farm__institution=user, qr_generated=False).count()

        return Response({
            "managed_farms_count": farms_count,
            "active_personnel": staff_count,
            "avg_yield": f"{total_yield:,} kg",
            "pending_reports": pending
        })

class InstitutionPersonnelListView(APIView):
    """
    NEW: Resolves the 404 error in the frontend.
    Returns all users linked to the logged-in Institution.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Fetch all staff linked via the 'associated_institution' ForeignKey
        staff = User.objects.filter(associated_institution=request.user)
        
        data = [{
            "id": p.id,
            "email": p.email,
            "username": p.first_name if p.first_name else p.email.split('@')[0],
            "role": p.get_role_display() if hasattr(p, 'get_role_display') else p.role,
        } for p in staff]
        
        return Response(data)

class InstitutionFarmListView(viewsets.ReadOnlyModelViewSet):
    """
    Returns specific status for the 'Managed Estate Units' table.
    """
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        queryset = Farm.objects.filter(institution=request.user)
        data = []
        for farm in queryset:
            # Dynamic calculation of yield per specific farm
            farm_yield = Batch.objects.filter(farm=farm).aggregate(total=Sum('quantity_kg'))['total'] or 0
            # Simple logic for % performance (yield vs target of 1000kg)
            perf_index = min(int((farm_yield / 1000) * 100), 100) if farm_yield > 0 else 0

            data.append({
                "id": farm.id,
                "name": farm.name,
                "lead_name": farm.correspondent.email if farm.correspondent else "Unassigned",
                "yield_performance": perf_index
            })
        return Response(data)

class InstitutionNotificationView(APIView):
    """Operational Intel based on recent Batch creations."""
    permission_classes = [IsAuthenticated]
    def get(self, request):
        recent = Batch.objects.filter(farm__institution=request.user).order_by('-created_at')[:5]
        notifications = [{
            "message": f"Harvest entry: {b.quantity_kg}kg of {b.crop_name} at {b.farm.name}",
            "type": "info",
            "timestamp": b.created_at.strftime("%I:%M %p")
        } for b in recent]
        return Response(notifications)

# =================================
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
    
  #pssword reset
  # --- PART 1: INITIATE RESET ---
class PasswordResetRequestView(APIView):
    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            
            # Security token generation
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Link points back to the React frontend route
            reset_url = f"http://localhost:5173/reset-password/{uid}/{token}/"
            
            send_mail(
                subject="Reset Your HarvestHub Password",
                message=f"Click the link below to reset your password: \n\n {reset_url}",
                from_email="noreply@harvesthub.com",
                recipient_list=[email],
                fail_silently=False,
            )
            
            return Response({"detail": "Reset link sent successfully."}, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            # Masking existence for security (Email Enumeration protection)
            return Response({"detail": "If this email exists, a reset link has been sent."}, status=status.HTTP_200_OK)

# --- PART 2: PROCESS NEW PASSWORD ---
class PasswordResetConfirmView(APIView):
    """
    This view receives the UID and Token from the React frontend 
    and updates the user's password if valid.
    """
    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        if not all([uidb64, token, new_password]):
            return Response({"error": "Missing required fields."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Decode the UID back into the database ID
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)

            # Validate the cryptographic token against the user
            if default_token_generator.check_token(user, token):
                user.set_password(new_password)
                user.save()
                return Response({"detail": "Password has been reset successfully."}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Token is invalid or has expired."}, status=status.HTTP_400_BAD_REQUEST)

        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": "Invalid user ID or malformed request."}, status=status.HTTP_400_BAD_REQUEST)
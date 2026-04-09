from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    # Operational Views
    FarmViewSet, UserRoleViewSet, UserListViewSet,
    # Auth Views
    RegisterView, CustomTokenObtainPairView, GoogleLoginView, social_token_exchange,
    UserProfileView,
    # Institution Views
    InstitutionStatsView, InstitutionNotificationView, 
    InstitutionPersonnelListView, InstitutionFarmListView,
    # Admin Views
    AdminDashboardStatsView, AdminRegistrationView,
    # Production Views
    BatchListCreateView
)
from rest_framework_simplejwt.views import TokenRefreshView

# ==========================================
# SECTION 1: ROUTER CONFIGURATION
# ==========================================
router = DefaultRouter()

# Standard Operational ViewSets
router.register(r'farms', FarmViewSet, basename='farm')

# Administrative & Directory ViewSets
router.register(r'role-management', UserRoleViewSet, basename='user_role')
router.register(r'users', UserListViewSet, basename='user_list')

# Institution-Specific Farm Status Table (Managed Estate Units)
router.register(r'institution/farms', InstitutionFarmListView, basename='institution-farms')

urlpatterns = [
    # Router URLs (Standard CRUD)
    path('', include(router.urls)),
    
    # ==========================================
    # SECTION 2: AUTHENTICATION & IDENTITY
    # ==========================================
    # Google OAuth & Token Exchange
    path('auth/google-login/', GoogleLoginView.as_view(), name='google_login_api'),
    path('auth/social-exchange/', social_token_exchange, name='social_token_exchange'),
    
    # Standard JWT Identity Management
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile management (GET for fetch, PATCH for update)
    path('auth/user/', UserProfileView.as_view(), name='user-profile'),

    # ==========================================
    # SECTION 3: INSTITUTION DASHBOARD (HIERARCHY)
    # ==========================================
    # High-level metrics for Institution users
    path('institution/stats/', InstitutionStatsView.as_view(), name='institution-stats'),
    
    # Staff list (Linked via associated_institution)
    path('institution/personnel/', InstitutionPersonnelListView.as_view(), name='institution-personnel'),
    
    # Feed of recent harvest activities
    path('institution/notifications/', InstitutionNotificationView.as_view(), name='institution-notifications'),

    # ==========================================
    # SECTION 4: ADMIN DASHBOARD (SYSTEM-WIDE)
    # ==========================================
    # System stats and user overrides
    path('admin/stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
    path('admin/stats/<int:pk>/', AdminDashboardStatsView.as_view(), name='admin-stats-detail'),
    
    # Dedicated endpoint for Superadmins to provision new Admins
    path('admin/create-user/', AdminRegistrationView.as_view(), name='admin-create'),

    # ==========================================
    # SECTION 5: FIELD PRODUCTION & HARVEST
    # ==========================================
    # Logic for FarmHands to record batches and view logs
    path('batches/', BatchListCreateView.as_view(), name='batch_list_create'),
]
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView
from allauth.socialaccount.providers.google.views import OAuth2LoginView

# ==========================================
# SECTION 1: ROUTER CONFIGURATION
# ==========================================
router = DefaultRouter()

# Standard Operational ViewSets
router.register(r'farms', FarmViewSet, basename='farm')

# Administrative & Directory ViewSets
router.register(r'role-management', UserRoleViewSet, basename='user_role')
router.register(r'users', UserListViewSet, basename='user_list')

# --- NEW: Institution-Specific Farm Status Table ---
# This matches the frontend requirement for "Managed Farm Status"
router.register(r'institution/farms', InstitutionFarmListView, basename='institution-farms')

urlpatterns = [
    # 1. Router URLs (Automated paths for ViewSets)
    path('', include(router.urls)),
    
    # ==========================================
    # SECTION 2: AUTHENTICATION & SOCIAL
    # ==========================================
    # Google OAuth 2.0
    path('auth/google/', OAuth2LoginView.adapter_view, name='google_login'),
    path('auth/social-exchange/', social_token_exchange, name='social_token_exchange'),
    
    # Standard Identity Management
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile management (GET for fetch, PATCH for update)
    path('auth/user/', UserProfileView.as_view(), name='user-profile'),
    path('auth/user/update/', UserProfileView.as_view(), name='user-profile-update'),

    # ==========================================
    # SECTION 3: INSTITUTION DASHBOARD (HIERARCHY)
    # ==========================================
    # --- NEW: Endpoints for the Institution-level Dashboard cards & sidebar ---
    path('institution/stats/', InstitutionStatsView.as_view(), name='institution-stats'),
    path('institution/notifications/', InstitutionNotificationView.as_view(), name='institution-notifications'),

    # ==========================================
    # SECTION 4: ADMIN DASHBOARD (SYSTEM-WIDE)
    # ==========================================
    path('admin/stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
    path('admin/stats/<int:pk>/', AdminDashboardStatsView.as_view(), name='admin-stats-detail'),
    path('admin/create-user/', AdminRegistrationView.as_view(), name='admin-create'),

    # ==========================================
    # SECTION 5: PRODUCTION & HARVEST
    # ==========================================
    # Logic for FarmHands to record batches and view logs
    path('batches/', BatchListCreateView.as_view(), name='batch_list_create'),
]
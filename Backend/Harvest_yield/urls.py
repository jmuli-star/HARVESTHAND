from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'farms', FarmViewSet, basename='farm')
# We use 'role-management' to avoid conflict with 'users'
router.register(r'role-management', UserRoleViewSet, basename='user_role')
router.register(r'users', UserListViewSet, basename='user_list')
router.register(r'institution/farms', InstitutionFarmListView, basename='institution-farms')

urlpatterns = [
    # 1. Router URLs (Includes the Institution Farms Table)
    path('', include(router.urls)),
    
    # 2. Institution Dashboard Endpoints (FIXES THE 404 ERRORS)
    path('institution/stats/', InstitutionStatsView.as_view(), name='institution-stats'),
    path('institution/notifications/', InstitutionNotificationView.as_view(), name='institution-notifications'),

    # 3. Admin Dashboard logic
    path('admin/stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
    path('admin/stats/<int:pk>/', AdminDashboardStatsView.as_view(), name='admin-stats-detail'),
    path('admin/create-user/', AdminRegistrationView.as_view(), name='admin-create'),

    # 4. Authentication & Registration
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # 5. Profile & Settings
    path('auth/user/', UserProfileView.as_view(), name='user-profile'),
    path('auth/user/update/', UserProfileView.as_view(), name='user-profile-update'),
    
    # 6. Production & Harvest Logic
    path('batches/', BatchListCreateView.as_view(), name='batch_list_create'),
]
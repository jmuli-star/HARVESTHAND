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
    # Router URLs
    path('', include(router.urls)),
    
    #admin dashboard statistics logic
    path('admin/stats/', AdminDashboardStatsView.as_view(), name ='admin-dashboard-stats'),
    path('admin/stats/<int:pk>/', AdminDashboardStatsView.as_view(), name ='admin-stats-detail'),
    path('batches/', BatchListCreateView.as_view(), name ='batch_list_create'),
    path('admin/create-user/', AdminRegistrationView.as_view(), name ='admin-create'),
    path('admin/stats/', AdminDashboardStatsView.as_view(), name ='admin-stats'),

    # Authentication & Registration (Standard APIViews)
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # 5. Production & Harvest Logic
    path('batches/', BatchListCreateView.as_view(), name='batch_list_create'),
    # 1. Profile & Settings Endpoints (Fixes the 404)
    # These match the 'auth/user/' and 'auth/user/update/' calls in React
    path('auth/user/', UserProfileView.as_view(), name='user-profile'),
    path('auth/user/update/', UserProfileView.as_view(), name='user-profile-update'),
]

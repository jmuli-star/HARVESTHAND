from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'farms', FarmViewSet, basename='farm')
# We use 'role-management' to avoid conflict with 'users'
router.register(r'role-management', UserRoleViewSet, basename='user_role')
router.register(r'users', UserListViewSet, basename='user_list')

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),

    # Authentication & Registration (Standard APIViews)
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
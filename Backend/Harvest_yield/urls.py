from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'farms', FarmViewSet)
router.register(r'users', UserRoleViewSet, basename='user_role')
router.register(r'users/list', UserListViewSet, basename='user_list')

urlpatterns = [
    path('', include(router.urls)),
]
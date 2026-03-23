# from rest_framework import permissions

# class IsOwnerOrReadOnly(permissions.BasePermission):
#     def has_object_permission(self, request, view, obj):
#         if request.method in permissions.SAFE_METHODS:
#             return True
#         return obj.farmhand == request.user

# class IsFarminstitutionrOrHigher(permissions.BasePermission):
#     def has_permission(self, request, view):
#         return request.user.is_authenticated and request.user.is_writer_or_higher()

# class IsFarmcorrespondentOrHigher(permissions.BasePermission):
#     def has_permission(self, request, view):
#         return request.user.is_authenticated and request.user.is_editor_or_higher()

# class IsFarmhandOrHigher(permissions.BasePermission):
#     def has_permission(self, request, view):
#         return request.user.is_authenticated and request.user.is_admin_or_higher()

# class IsAdmin(permissions.BasePermission):
#     def has_permission(self, request, view):
#         return request.user.is_authenticated and request.user.is_superadmin()
from rest_framework import permissions

# --- 1. Object Ownership Logic ---
class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of a profile/farm to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions (GET, HEAD, OPTIONS) are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Check if the object is tied to the requesting user
        # Handles both direct User links and FarmHand -> User links
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'farmhand'):
            return obj.farmhand.user == request.user
            
        return False

# --- 2. Hierarchical Role Permissions ---
# These call the boolean methods we added to your User model in Part 1

class IsFarminstitutionOrHigher(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_farminstitution_or_higher()
        )

class IsFarmcorrespondentOrHigher(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_farmcorrespondent_or_higher()
        )

class IsFarmhandOrHigher(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_farmhand_or_higher()
        )

# --- 3. Strict Admin Gatekeeper ---
class IsAdminUserRole(permissions.BasePermission):
    """
    The master permission for the Admin Dashboard.
    Ensures ONLY users with role='admin' can see system stats.
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_admin_or_higher()
        )
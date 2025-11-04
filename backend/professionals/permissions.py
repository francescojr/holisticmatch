"""
Custom permissions for the professionals app.
"""
from rest_framework import permissions


class IsAuthenticatedAndOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow authenticated users to create,
    and owners to edit/delete their own objects.
    Read permissions are allowed to any request.
    """

    def has_permission(self, request, view):
        """
        Check if user has permission to perform the action.
        For write operations, user must be authenticated.
        """
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write operations require authentication
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        """
        Return True if permission is granted, False otherwise.
        """
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the professional
        return obj.user == request.user
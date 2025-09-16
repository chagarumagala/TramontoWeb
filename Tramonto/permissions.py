from rest_framework.permissions import BasePermission

class IsNotClient(BasePermission):
    """
    Allows access only to users who are not clients.
    """

    def has_permission(self, request, view):
        return not request.user.is_client
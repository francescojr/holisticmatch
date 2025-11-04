"""
Unit tests for professional permissions.
Tests custom permission classes.
"""
import pytest
from django.contrib.auth.models import User, AnonymousUser
from rest_framework.test import APIRequestFactory
from professionals.permissions import IsAuthenticatedAndOwnerOrReadOnly
from professionals.models import Professional


@pytest.fixture
def permission():
    """Permission instance fixture"""
    return IsAuthenticatedAndOwnerOrReadOnly()


@pytest.fixture
def factory():
    """Request factory fixture"""
    return APIRequestFactory()


@pytest.fixture
def owner_user():
    """Create an owner user"""
    return User.objects.create_user(
        username='owner',
        email='owner@example.com',
        password='testpass123'
    )


@pytest.fixture
def other_user():
    """Create another user"""
    return User.objects.create_user(
        username='other',
        email='other@example.com',
        password='testpass123'
    )


@pytest.fixture
def professional(owner_user):
    """Create a professional owned by owner_user"""
    return Professional.objects.create(
        user=owner_user,
        name='Test Professional',
        bio='Test bio',
        services=['Reiki'],
        city='São Paulo',
        state='SP',
        price_per_session=100.00,
        attendance_type='presencial',
        whatsapp='11999999999',
        email='test@example.com',
    )


class TestIsAuthenticatedAndOwnerOrReadOnly:
    """Test IsAuthenticatedAndOwnerOrReadOnly permission"""

    @pytest.mark.django_db
    def test_has_permission_safe_methods_anonymous(self, permission, factory):
        """Test safe methods are allowed for anonymous users"""
        safe_methods = ['GET', 'HEAD', 'OPTIONS']

        for method in safe_methods:
            request = getattr(factory, method.lower())('/api/professionals/')
            request.user = AnonymousUser()
            assert permission.has_permission(request, None) is True

    @pytest.mark.django_db
    def test_has_permission_safe_methods_authenticated(self, permission, factory, owner_user):
        """Test safe methods are allowed for authenticated users"""
        safe_methods = ['GET', 'HEAD', 'OPTIONS']

        for method in safe_methods:
            request = getattr(factory, method.lower())('/api/professionals/')
            request.user = owner_user
            assert permission.has_permission(request, None) is True

    @pytest.mark.django_db
    def test_has_permission_write_methods_anonymous(self, permission, factory):
        """Test write methods require authentication"""
        write_methods = ['POST', 'PUT', 'PATCH', 'DELETE']

        for method in write_methods:
            request = getattr(factory, method.lower())('/api/professionals/')
            request.user = AnonymousUser()
            assert permission.has_permission(request, None) is False

    @pytest.mark.django_db
    def test_has_permission_write_methods_authenticated(self, permission, factory, owner_user):
        """Test write methods are allowed for authenticated users"""
        write_methods = ['POST', 'PUT', 'PATCH', 'DELETE']

        for method in write_methods:
            request = getattr(factory, method.lower())('/api/professionals/')
            request.user = owner_user
            assert permission.has_permission(request, None) is True

    @pytest.mark.django_db
    def test_has_object_permission_safe_methods(self, permission, factory, professional, owner_user, other_user):
        """Test object permissions for safe methods"""
        safe_methods = ['GET', 'HEAD', 'OPTIONS']

        for method in safe_methods:
            # Owner can access
            request = getattr(factory, method.lower())(f'/api/professionals/{professional.id}/')
            request.user = owner_user
            assert permission.has_object_permission(request, None, professional) is True

            # Other user can access
            request.user = other_user
            assert permission.has_object_permission(request, None, professional) is True

            # Anonymous user can access
            request.user = AnonymousUser()
            assert permission.has_object_permission(request, None, professional) is True

    @pytest.mark.django_db
    def test_has_object_permission_write_methods_owner(self, permission, factory, professional, owner_user):
        """Test object permissions for write methods - owner"""
        write_methods = ['PUT', 'PATCH', 'DELETE']

        for method in write_methods:
            request = getattr(factory, method.lower())(f'/api/professionals/{professional.id}/')
            request.user = owner_user
            assert permission.has_object_permission(request, None, professional) is True

    @pytest.mark.django_db
    def test_has_object_permission_write_methods_other_user(self, permission, factory, professional, other_user):
        """Test object permissions for write methods - other user"""
        write_methods = ['PUT', 'PATCH', 'DELETE']

        for method in write_methods:
            request = getattr(factory, method.lower())(f'/api/professionals/{professional.id}/')
            request.user = other_user
            assert permission.has_object_permission(request, None, professional) is False

    @pytest.mark.django_db
    def test_has_object_permission_write_methods_anonymous(self, permission, factory, professional):
        """Test object permissions for write methods - anonymous"""
        write_methods = ['PUT', 'PATCH', 'DELETE']

        for method in write_methods:
            request = getattr(factory, method.lower())(f'/api/professionals/{professional.id}/')
            request.user = AnonymousUser()
            assert permission.has_object_permission(request, None, professional) is False
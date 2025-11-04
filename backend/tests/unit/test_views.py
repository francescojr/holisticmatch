"""
Unit tests for professional views.
Tests ViewSet operations and custom actions.
"""
import pytest
from django.contrib.auth.models import User
from django.core.files.base import ContentFile
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from professionals.models import Professional
from professionals.constants import SERVICE_TYPES


@pytest.fixture
def api_client():
    """API client fixture"""
    return APIClient()


@pytest.fixture
def user():
    """Create a test user"""
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123'
    )


@pytest.fixture
def other_user():
    """Create another test user"""
    return User.objects.create_user(
        username='otheruser',
        email='other@example.com',
        password='testpass123'
    )


@pytest.fixture
def professional(user):
    """Create a test professional"""
    return Professional.objects.create(
        user=user,
        name='João Silva',
        bio='Especialista em Reiki',
        services=['Reiki', 'Meditação'],
        city='São Paulo',
        state='SP',
        price_per_session=150.00,
        attendance_type='presencial',
        whatsapp='11999999999',
        email='joao@example.com',
    )


@pytest.fixture
def auth_client(api_client, user):
    """Authenticated API client"""
    refresh = RefreshToken.for_user(user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client


@pytest.fixture
def other_auth_client(api_client, other_user):
    """Authenticated API client for other user"""
    refresh = RefreshToken.for_user(other_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client


class TestProfessionalViewSet:
    """Test ProfessionalViewSet operations"""

    @pytest.mark.django_db
    def test_get_serializer_class_list(self, user, professional):
        """Test that list action uses ProfessionalSummarySerializer"""
        from professionals.views import ProfessionalViewSet
        from professionals.serializers import ProfessionalSummarySerializer

        viewset = ProfessionalViewSet()
        viewset.action = 'list'
        assert viewset.get_serializer_class() == ProfessionalSummarySerializer

    @pytest.mark.django_db
    def test_get_serializer_class_detail(self, user, professional):
        """Test that detail actions use ProfessionalSerializer"""
        from professionals.views import ProfessionalViewSet
        from professionals.serializers import ProfessionalSerializer

        viewset = ProfessionalViewSet()
        viewset.action = 'retrieve'
        assert viewset.get_serializer_class() == ProfessionalSerializer

        viewset.action = 'create'
        assert viewset.get_serializer_class() == ProfessionalSerializer

    @pytest.mark.django_db
    def test_get_permissions_list_action(self, user, professional):
        """Test permissions for list action allow any"""
        from professionals.views import ProfessionalViewSet
        from rest_framework.permissions import AllowAny

        viewset = ProfessionalViewSet()
        viewset.action = 'list'
        permissions = viewset.get_permissions()

        # Should contain AllowAny permission
        assert any(isinstance(perm, AllowAny) for perm in permissions)

    @pytest.mark.django_db
    def test_get_permissions_write_actions(self, user, professional):
        """Test permissions for write actions require ownership"""
        from professionals.views import ProfessionalViewSet
        from professionals.permissions import IsAuthenticatedAndOwnerOrReadOnly

        viewset = ProfessionalViewSet()
        viewset.action = 'create'
        permissions = viewset.get_permissions()

        # Should contain IsAuthenticatedAndOwnerOrReadOnly permission
        assert any(isinstance(perm, IsAuthenticatedAndOwnerOrReadOnly) for perm in permissions)

    @pytest.mark.django_db
    def test_perform_create_associates_user(self, user):
        """Test that perform_create associates professional with authenticated user"""
        from professionals.views import ProfessionalViewSet
        from professionals.serializers import ProfessionalSerializer

        viewset = ProfessionalViewSet()
        # Mock request with user
        class MockRequest:
            def __init__(self, user):
                self.user = user

        viewset.request = MockRequest(user)

        # Create serializer with valid data
        data = {
            'name': 'Test Professional',
            'bio': 'Test bio with at least 50 characters to pass validation. This is a longer bio that should satisfy the minimum length requirement for validation purposes.',
            'services': ['Reiki'],
            'city': 'São Paulo',
            'state': 'SP',
            'price_per_session': 100.00,
            'attendance_type': 'presencial',
            'whatsapp': '11999999999',
            'email': 'test@example.com',
        }
        serializer = ProfessionalSerializer(data=data)
        assert serializer.is_valid(), f"Serializer errors: {serializer.errors}"

        # Call perform_create
        viewset.perform_create(serializer)

        # Check that professional was created and associated with user
        assert serializer.instance.user == user

    @pytest.mark.django_db
    def test_service_types_action(self, api_client):
        """Test service types endpoint returns correct data"""
        # This is a unit test for the action method, not full integration
        from professionals.views import ProfessionalViewSet

        viewset = ProfessionalViewSet()
        result = viewset.service_types(None)  # Request can be None for this test

        assert result.data == SERVICE_TYPES
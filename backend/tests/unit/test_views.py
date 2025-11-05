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

    @pytest.mark.django_db
    def test_register_action_success(self, api_client):
        """Test successful professional registration with password"""
        data = {
            'name': 'New Professional',
            'email': 'newpro@example.com',
            'password': 'SecurePass123',
            'bio': 'A bio with at least 50 characters to pass validation. This is a longer bio that should satisfy the minimum.',
            'services': ['Reiki', 'Meditação Guiada'],
            'city': 'São Paulo',
            'state': 'SP',
            'price_per_session': 150.00,
            'attendance_type': 'presencial',
            'whatsapp': '11999999999',
        }
        
        # Use the correct endpoint from the router
        response = api_client.post('/api/v1/professionals/register/', data, format='json')
        
        assert response.status_code == 201, f"Expected 201, got {response.status_code}. Response: {response.data}"
        assert 'professional' in response.data
        assert response.data['professional']['name'] == 'New Professional'
        
        # Check that user was created
        assert User.objects.filter(email='newpro@example.com').exists()

    @pytest.mark.django_db
    def test_register_action_weak_password(self, api_client):
        """Test registration fails with weak password"""
        data = {
            'name': 'New Professional',
            'email': 'newpro@example.com',
            'password': 'weak123',  # No uppercase
            'bio': 'A bio with at least 50 characters to pass validation. This is a longer bio that should satisfy the minimum.',
            'services': ['Reiki'],
            'city': 'São Paulo',
            'state': 'SP',
            'price_per_session': 150.00,
            'attendance_type': 'presencial',
            'whatsapp': '11999999999',
        }
        
        response = api_client.post('/api/v1/professionals/register/', data, format='json')
        
        assert response.status_code == 400
        assert 'password' in response.data

    @pytest.mark.django_db
    def test_register_action_duplicate_email(self, api_client, user):
        """Test registration fails with duplicate email - validates unique constraint"""
        # Try to register with an email that's already used by a User
        data = {
            'name': 'Another Professional',
            'email': 'test@example.com',  # Same as user fixture's email
            'password': 'SecurePass123',
            'bio': 'A bio with at least 50 characters to pass validation. This is a longer bio that should satisfy the minimum.',
            'services': ['Reiki'],
            'city': 'São Paulo',
            'state': 'SP',
            'price_per_session': 150.00,
            'attendance_type': 'presencial',
            'whatsapp': '11999999999',
        }
        
        response = api_client.post('/api/v1/professionals/register/', data, format='json')
        
        # Must fail with 400 (not 500 IntegrityError)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}. Response: {response.data}"
        # Must have email field or non_field_errors
        assert 'email' in response.data or 'non_field_errors' in response.data

    @pytest.mark.django_db
    def test_register_action_allows_any(self, api_client):
        """Test that register action allows unauthenticated requests"""
        # This should NOT require authentication
        data = {
            'name': 'Anonymous Professional',
            'email': 'anon@example.com',
            'password': 'SecurePass123',
            'bio': 'A bio with at least 50 characters to pass validation. This is a longer bio that should satisfy the minimum.',
            'services': ['Reiki'],
            'city': 'São Paulo',
            'state': 'SP',
            'price_per_session': 150.00,
            'attendance_type': 'presencial',
            'whatsapp': '11999999999',
        }
        
        # No authentication credentials provided
        response = api_client.post('/api/v1/professionals/register/', data, format='json')
        
        # Should succeed (201) or fail validation (400), but NOT 401 (Unauthorized)
        assert response.status_code in [201, 400]
        assert response.status_code != 401

    @pytest.mark.django_db
    def test_register_returns_jwt_tokens(self, api_client):
        """Test that register action returns JWT access and refresh tokens"""
        data = {
            'name': 'JWT Test Professional',
            'email': 'jwt@example.com',
            'password': 'SecurePass123',
            'bio': 'A bio with at least 50 characters to pass validation. This is a longer bio that should satisfy the minimum.',
            'services': ['Reiki'],
            'city': 'São Paulo',
            'state': 'SP',
            'price_per_session': 150.00,
            'attendance_type': 'presencial',
            'whatsapp': '11999999999',
        }
        
        response = api_client.post('/api/v1/professionals/register/', data, format='json')
        
        assert response.status_code == 201
        # Verify JWT tokens are present
        assert 'access' in response.data, "JWT access token missing from register response"
        assert 'refresh' in response.data, "JWT refresh token missing from register response"
        # Verify tokens are non-empty strings
        assert isinstance(response.data['access'], str) and len(response.data['access']) > 0
        assert isinstance(response.data['refresh'], str) and len(response.data['refresh']) > 0
        # Verify User was created but is inactive (pending email verification)
        user = User.objects.get(email='jwt@example.com')
        assert user.is_active is False, "New user should be inactive until email verification"

    @pytest.mark.django_db
    def test_verify_email_action_success(self, api_client):
        """Test successful email verification with valid token"""
        from professionals.models import EmailVerificationToken
        
        # Create an unverified user
        user = User.objects.create_user(
            username='unverified@example.com',
            email='unverified@example.com',
            password='SecurePass123',
            is_active=False
        )
        
        # Create verification token
        token = EmailVerificationToken.create_token(user)
        
        # Verify email
        response = api_client.post(
            '/api/v1/professionals/verify-email/',
            {'token': token.token},
            format='json'
        )
        
        assert response.status_code == 200
        assert response.data['message'] == 'Email verificado com sucesso!'
        
        # Check that user is now active
        user.refresh_from_db()
        assert user.is_active == True

    @pytest.mark.django_db
    def test_verify_email_action_invalid_token(self, api_client):
        """Test email verification fails with invalid token"""
        response = api_client.post(
            '/api/v1/professionals/verify-email/',
            {'token': 'invalid_token_12345'},
            format='json'
        )
        
        assert response.status_code == 400
        assert 'token' in response.data  # Validation error on token field

    @pytest.mark.django_db
    def test_verify_email_action_expired_token(self, api_client):
        """Test email verification fails with expired token"""
        from professionals.models import EmailVerificationToken
        from django.utils import timezone
        from datetime import timedelta
        
        # Create an unverified user
        user = User.objects.create_user(
            username='expired@example.com',
            email='expired@example.com',
            password='SecurePass123',
            is_active=False
        )
        
        # Create token that's already expired
        expired_token = EmailVerificationToken.objects.create(
            user=user,
            token='expired_token_123',
            expires_at=timezone.now() - timedelta(hours=1)
        )
        
        # Try to verify
        response = api_client.post(
            '/api/v1/professionals/verify-email/',
            {'token': 'expired_token_123'},
            format='json'
        )
        
        assert response.status_code == 400

    @pytest.mark.django_db
    def test_resend_verification_action_success(self, api_client):
        """Test resend verification email for unverified account"""
        # Create an unverified user
        user = User.objects.create_user(
            username='resend@example.com',
            email='resend@example.com',
            password='SecurePass123',
            is_active=False
        )
        
        response = api_client.post(
            '/api/v1/professionals/resend-verification/',
            {'email': 'resend@example.com'},
            format='json'
        )
        
        assert response.status_code == 200
        assert 'message' in response.data

    @pytest.mark.django_db
    def test_resend_verification_action_already_verified(self, api_client):
        """Test resend verification fails if email already verified"""
        user = User.objects.create_user(
            username='verified@example.com',
            email='verified@example.com',
            password='SecurePass123',
            is_active=True
        )
        
        response = api_client.post(
            '/api/v1/professionals/resend-verification/',
            {'email': 'verified@example.com'},
            format='json'
        )
        
        assert response.status_code == 400
        assert 'email' in response.data  # Validation error on email field

    @pytest.mark.django_db
    def test_resend_verification_action_nonexistent_email(self, api_client):
        """Test resend verification for non-existent email (security)"""
        response = api_client.post(
            '/api/v1/professionals/resend-verification/',
            {'email': 'nonexistent@example.com'},
            format='json'
        )
        
        # Should fail validation since email doesn't exist
        # (Different from register endpoint - this is more strict)
        assert response.status_code == 400
        assert 'email' in response.data

    @pytest.mark.django_db
    def test_cities_endpoint_valid_state(self, api_client):
        """Test cities endpoint with valid state returns list of cities"""
        from professionals.models import City
        
        # Use get_or_create to avoid duplicate constraint violations
        City.objects.get_or_create(state='SP', name='São Paulo')
        City.objects.get_or_create(state='SP', name='Campinas')
        City.objects.get_or_create(state='SP', name='Santos')
        
        response = api_client.get('/api/v1/professionals/cities/SP/')
        
        assert response.status_code == 200
        assert response.data['state'] == 'SP'
        assert response.data['count'] >= 3
        assert 'São Paulo' in response.data['cities']
        assert 'Campinas' in response.data['cities']
        assert 'Santos' in response.data['cities']
        # Cities should be sorted
        assert response.data['cities'] == sorted(response.data['cities'])

    @pytest.mark.django_db
    def test_cities_endpoint_invalid_state(self, api_client):
        """Test cities endpoint with invalid state code"""
        response = api_client.get('/api/v1/professionals/cities/XX/')
        
        assert response.status_code == 400
        assert 'Invalid state code' in response.data['error']

    @pytest.mark.django_db
    def test_cities_endpoint_no_cities_found(self, api_client):
        """Test cities endpoint when no cities exist for state"""
        from professionals.models import City
        
        # Use a state that has no cities
        # Delete any existing AL (Alagoas) cities first to ensure clean state
        City.objects.filter(state='AL').delete()
        
        response = api_client.get('/api/v1/professionals/cities/AL/')
        
        assert response.status_code == 404
        assert 'No cities found' in response.data['error']

    @pytest.mark.django_db
    def test_cities_endpoint_case_insensitive(self, api_client):
        """Test cities endpoint accepts lowercase state code"""
        # Test with lowercase - Belo Horizonte is already loaded in the test fixture
        response = api_client.get('/api/v1/professionals/cities/mg/')
        
        assert response.status_code == 200
        assert response.data['state'] == 'MG'
        assert 'Belo Horizonte' in response.data['cities']
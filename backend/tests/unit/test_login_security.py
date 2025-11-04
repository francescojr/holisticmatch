"""
Tests for login security.
Covers authentication with email verification requirement.
"""
import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from professionals.models import EmailVerificationToken
from datetime import timedelta
from django.utils import timezone


@pytest.mark.django_db
class TestLoginSecurity:
    """Tests for login endpoint with email verification requirement"""

    @pytest.fixture
    def client(self):
        """Create API client"""
        return APIClient()

    @pytest.fixture
    def verified_user(self):
        """Create verified user"""
        user = User.objects.create_user(
            username='verified@example.com',
            email='verified@example.com',
            password='Password@123'
        )
        user.is_active = True
        user.save()
        return user

    @pytest.fixture
    def unverified_user(self):
        """Create unverified user"""
        user = User.objects.create_user(
            username='unverified@example.com',
            email='unverified@example.com',
            password='Password@123'
        )
        user.is_active = False  # Not verified
        user.save()
        return user

    def test_login_with_verified_email(self, client, verified_user):
        """Test successful login with verified email"""
        response = client.post(
            '/api/v1/auth/login/',
            {
                'email': 'verified@example.com',
                'password': 'Password@123'
            },
            format='json'
        )

        assert response.status_code == 200
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert 'user' in response.data
        assert response.data['user']['email'] == 'verified@example.com'

    def test_login_with_unverified_email(self, client, unverified_user):
        """Test login blocked with unverified email (TASK 7.2)"""
        response = client.post(
            '/api/v1/auth/login/',
            {
                'email': 'unverified@example.com',
                'password': 'Password@123'
            },
            format='json'
        )

        assert response.status_code == 403
        assert 'verifique seu email' in response.data['detail'].lower()

    def test_login_with_invalid_password(self, client, verified_user):
        """Test login with invalid password"""
        response = client.post(
            '/api/v1/auth/login/',
            {
                'email': 'verified@example.com',
                'password': 'WrongPassword@123'
            },
            format='json'
        )

        assert response.status_code == 401
        assert 'inválidos' in response.data['detail'].lower()

    def test_login_with_nonexistent_email(self, client):
        """Test login with non-existent email"""
        response = client.post(
            '/api/v1/auth/login/',
            {
                'email': 'nonexistent@example.com',
                'password': 'Password@123'
            },
            format='json'
        )

        assert response.status_code == 401
        assert 'inválidos' in response.data['detail'].lower()

    def test_login_missing_email(self, client):
        """Test login with missing email"""
        response = client.post(
            '/api/v1/auth/login/',
            {'password': 'Password@123'},
            format='json'
        )

        assert response.status_code == 400

    def test_login_missing_password(self, client):
        """Test login with missing password"""
        response = client.post(
            '/api/v1/auth/login/',
            {'email': 'verified@example.com'},
            format='json'
        )

        assert response.status_code == 400

    def test_login_returns_valid_jwt_tokens(self, client, verified_user):
        """Test that login returns valid JWT tokens"""
        response = client.post(
            '/api/v1/auth/login/',
            {
                'email': 'verified@example.com',
                'password': 'Password@123'
            },
            format='json'
        )

        assert response.status_code == 200
        
        # Access token should be JWT format (3 parts separated by dots)
        access_token = response.data['access']
        refresh_token = response.data['refresh']
        
        assert access_token.count('.') == 2
        assert refresh_token.count('.') == 2

    def test_login_user_info_returned(self, client, verified_user):
        """Test that login returns correct user info"""
        response = client.post(
            '/api/v1/auth/login/',
            {
                'email': 'verified@example.com',
                'password': 'Password@123'
            },
            format='json'
        )

        assert response.status_code == 200
        user_data = response.data['user']
        
        assert user_data['id'] == verified_user.id
        assert user_data['email'] == 'verified@example.com'
        assert user_data['username'] == 'verified@example.com'


@pytest.mark.django_db
class TestLoginIntegration:
    """Integration tests for login flow"""

    @pytest.fixture
    def client(self):
        """Create API client"""
        return APIClient()

    def test_full_registration_to_login_flow(self, client):
        """Test full flow: registration -> email verification -> login"""
        # Note: This is a simplified test since registration requires City data
        # Full integration testing done manually
        
        # For now, test that we can create, verify, and login manually created users
        from django.contrib.auth.models import User
        from professionals.models import EmailVerificationToken
        
        # Create user directly (simulate registration - is_active should be False)
        user = User.objects.create_user(
            username='integration@example.com',
            email='integration@example.com',
            password='IntPass@123'
        )
        
        # Manually set is_active to False to simulate unverified user
        user.is_active = False
        user.save()
        
        # Verify initial state
        user.refresh_from_db()
        assert user.is_active == False
        
        # Create verification token
        token = EmailVerificationToken.create_token(user)
        
        # Verify email
        EmailVerificationToken.verify_token(token.token)
        user.refresh_from_db()
        
        # Now user should be active
        assert user.is_active == True
        
        # Login should now work
        login_response = client.post(
            '/api/v1/auth/login/',
            {
                'email': 'integration@example.com',
                'password': 'IntPass@123'
            },
            format='json'
        )
        
        assert login_response.status_code == 200
        assert 'access' in login_response.data

    def test_login_before_email_verification_blocked(self, client):
        """Test that login is blocked until email is verified (TASK 7.2)"""
        # Create user without verification
        user = User.objects.create_user(
            username='unverif@example.com',
            email='unverif@example.com',
            password='UnverPass@123'
        )
        
        # Explicitly set is_active to False (simulating unverified)
        user.is_active = False
        user.save()
        
        # Try to login before verification
        login_response = client.post(
            '/api/v1/auth/login/',
            {
                'email': 'unverif@example.com',
                'password': 'UnverPass@123'
            },
            format='json'
        )
        
        # Should be blocked with 403
        assert login_response.status_code == 403
        assert 'verifique seu email' in login_response.data['detail'].lower()

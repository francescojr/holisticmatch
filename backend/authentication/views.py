"""
Views for authentication.
Handles user registration, login, logout, and token refresh.
"""
from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from professionals.models import Professional, EmailVerificationToken


class LoginView(views.APIView):
    """
    Login endpoint
    POST /api/v1/auth/login/
    
    Authenticates user and returns JWT tokens
    Validates that email is verified before allowing login
    """
    permission_classes = [AllowAny]

    def post(self, request):
        """
        Authenticate user and return JWT tokens
        
        Request:
        {
            "email": "user@example.com",
            "password": "Password@123"
        }
        
        Response (success):
        {
            "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
            "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
            "user": {
                "id": 1,
                "email": "user@example.com",
                "username": "user@example.com"
            }
        }
        
        Response (email not verified):
        {
            "detail": "Por favor, verifique seu email antes de fazer login"
        } - Status 403
        
        Response (invalid credentials):
        {
            "detail": "Email ou senha inválidos"
        } - Status 401
        """
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {'detail': 'Email e senha são obrigatórios'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Use a dummy hash to prevent timing attacks
            # This makes the response time similar whether user exists or not
            from django.contrib.auth.hashers import make_password
            make_password(password)  # Simulate password check timing
            return Response(
                {'detail': 'Email ou senha inválidos'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Check password
        if not user.check_password(password):
            return Response(
                {'detail': 'Email ou senha inválidos'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Check if email is verified (TASK 7.2: Login Security)
        # User must be active (is_active=True set during email verification)
        import logging
        logger = logging.getLogger(__name__)
        
        # CRITICAL: Refresh from DB to ensure we have the latest is_active status
        # This prevents cache misses when user was just verified
        user.refresh_from_db()
        
        logger.info(f'[login] 🔍 Checking is_active for user: {email}')
        logger.info(f'[login] 📊 user.is_active = {user.is_active}')
        
        if not user.is_active:
            logger.warning(f'[login] ❌ User {email} is not active, blocking login')
            return Response(
                {'detail': 'Por favor, verifique seu email antes de fazer login'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Get professional info if it exists
        professional_id = None
        try:
            professional_id = user.professional.id
        except:
            pass  # User might not have professional yet

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'professional_id': professional_id
            }
        }, status=status.HTTP_200_OK)


class CurrentUserView(views.APIView):
    """
    Get current authenticated user info
    GET /api/v1/auth/me/
    
    Returns authenticated user and their professional profile data
    Requires valid JWT token in Authorization header
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Get current user profile
        
        Response:
        {
            "id": 1,
            "email": "user@example.com",
            "professional_id": 123,
            "full_name": "João Silva",
            "city": "São Paulo",
            "state": "SP"
        }
        """
        try:
            professional = request.user.professional
            
            return Response({
                'id': request.user.id,
                'email': request.user.email,
                'professional_id': professional.id,
                'full_name': professional.name,
                'city': professional.city,
                'state': professional.state,
                'photo': professional.photo.url if professional.photo else None,
                'bio': professional.bio,
                'whatsapp': professional.whatsapp,
            }, status=status.HTTP_200_OK)
        except Professional.DoesNotExist:
            return Response(
                {'detail': 'Professional profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RefreshTokenView(views.APIView):
    """
    Refresh JWT access token
    POST /api/v1/auth/refresh/
    
    Takes a refresh token and returns a new access token
    """
    permission_classes = [AllowAny]

    def post(self, request):
        """
        Refresh JWT access token
        
        Request:
        {
            "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
        }
        
        Response (success):
        {
            "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
        }
        
        Response (invalid refresh token):
        {
            "detail": "Token is invalid or expired"
        } - Status 401
        """
        refresh_token = request.data.get('refresh')
        
        if not refresh_token:
            return Response(
                {'detail': 'Refresh token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            refresh = RefreshToken(refresh_token)
            return Response({
                'access': str(refresh.access_token)
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'detail': 'Token is invalid or expired'},
                status=status.HTTP_401_UNAUTHORIZED
            )

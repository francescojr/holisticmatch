"""
Views for authentication.
Handles user registration, login, logout, and token refresh.
"""
from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
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
        if not user.is_active:
            return Response(
                {'detail': 'Por favor, verifique seu email antes de fazer login'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username
            }
        }, status=status.HTTP_200_OK)

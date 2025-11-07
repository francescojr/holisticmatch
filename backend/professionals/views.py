"""
Views for the professionals app.
Implements API endpoints for professional profiles.
"""
from django.contrib.auth.models import User
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend

from .models import Professional, City, EmailVerificationToken
from .serializers import (
    ProfessionalSerializer,
    ProfessionalSummarySerializer,
    ProfessionalCreateSerializer,
    EmailVerificationSerializer,
    ResendVerificationEmailSerializer,
    CitySerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)
from .filters import ProfessionalFilter
from .permissions import IsAuthenticatedAndOwnerOrReadOnly
from .constants import SERVICE_TYPES


class ProfessionalViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Professional model
    Provides full CRUD operations with proper permissions
    """
    queryset = Professional.objects.all()
    serializer_class = ProfessionalSerializer
    permission_classes = [IsAuthenticatedAndOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_class = ProfessionalFilter

    def get_serializer_class(self):
        """Use summary serializer for list view"""
        if self.action == 'list':
            return ProfessionalSummarySerializer
        return ProfessionalSerializer

    def get_permissions(self):
        """
        Allow anyone to read, register, and verify email
        Require authentication for other write operations
        """
        if self.action in ['list', 'retrieve', 'service_types', 'register', 'verify_email', 'resend_verification']:
            # Allow anyone for these actions
            return [AllowAny()]
        else:
            # Require ownership for other write operations (create, update, delete)
            return [IsAuthenticatedAndOwnerOrReadOnly()]

    def perform_create(self, serializer):
        """
        Associate the professional with the authenticated user
        """
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def service_types(self, request):
        """
        GET /api/professionals/service_types/
        Returns list of available service types
        """
        return Response(SERVICE_TYPES)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """
        POST /api/professionals/register/
        Register a new professional with password authentication
        Creates user account automatically and returns JWT tokens
        """
        from rest_framework_simplejwt.tokens import RefreshToken
        from django.db import IntegrityError
        
        serializer = ProfessionalCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                professional = serializer.save()
                
                # Generate JWT tokens for immediate use
                # Note: User is inactive until email verification
                # Login endpoint will enforce is_active check
                refresh = RefreshToken.for_user(professional.user)
                
                return Response(
                    {
                        'message': 'Profissional criado com sucesso. Verifique seu email para ativar a conta.',
                        'professional': ProfessionalSerializer(professional).data,
                        'access_token': str(refresh.access_token),
                        'refresh_token': str(refresh),
                        'user_id': professional.user.id,
                        'professional_id': professional.id,
                    },
                    status=status.HTTP_201_CREATED
                )
            except IntegrityError as e:
                # Handle race condition: email registered between validation and creation
                if 'email' in str(e).lower():
                    return Response(
                        {'email': 'Este email já está registrado'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                raise
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny], url_path='verify-email')
    def verify_email(self, request):
        """
        POST /api/professionals/verify-email/
        Verify email with token from registration link
        """
        serializer = EmailVerificationSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            email_token, result = EmailVerificationToken.verify_token(token)
            
            if result == 'verified':
                return Response({
                    'message': 'Email verificado com sucesso!',
                    'email': email_token.user.email,
                }, status=status.HTTP_200_OK)
            elif result == 'invalid_or_expired':
                return Response({
                    'error': 'Token expirado. Solicite um novo email de verificação.'
                }, status=status.HTTP_400_BAD_REQUEST)
            else:  # not_found
                return Response({
                    'error': 'Token inválido'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny], url_path='resend-verification')
    def resend_verification(self, request):
        """
        POST /api/professionals/resend-verification/
        Resend verification email for unverified account
        """
        serializer = ResendVerificationEmailSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                email_token = EmailVerificationToken.create_token(user, expiry_hours=24)
                
                # Send verification email
                try:
                    from django.core.mail import send_mail
                    verification_link = f"http://localhost:3000/verify-email/{email_token.token}"
                    
                    send_mail(
                        subject='Verifique seu email - HolisticMatch',
                        message=f'Clique no link para verificar seu email: {verification_link}',
                        from_email='noreply@holisticmatch.com',
                        recipient_list=[email],
                        fail_silently=False,
                    )
                except Exception as e:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f'Failed to send verification email: {str(e)}')
                
                return Response({
                    'message': 'Email de verificação enviado com sucesso!'
                }, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                # Don't reveal if email exists (security best practice)
                return Response({
                    'message': 'Se o email estiver registrado, você receberá um link de verificação'
                }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='upload-photo')
    def upload_photo(self, request, pk=None):
        """
        POST /api/professionals/{id}/upload-photo/
        Upload profile photo for a professional
        """
        try:
            # Get professional without automatic permission check
            try:
                professional = Professional.objects.get(pk=pk)
            except Professional.DoesNotExist:
                return Response(
                    {'error': 'Profissional não encontrado'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Check if user owns this professional profile
            if professional.user != request.user:
                return Response(
                    {'error': 'Você só pode alterar sua própria foto'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Check if photo file is provided
            if 'photo' not in request.FILES:
                return Response(
                    {'error': 'Arquivo de foto é obrigatório'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            photo_file = request.FILES['photo']

            # Validate file type
            allowed_types = ['image/jpeg', 'image/jpg', 'image/png']
            if photo_file.content_type not in allowed_types:
                return Response(
                    {'error': 'Foto deve ser JPG ou PNG'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate file size (5MB max)
            max_size = 5 * 1024 * 1024  # 5MB in bytes
            if photo_file.size > max_size:
                return Response(
                    {'error': 'Foto deve ter no máximo 5MB'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Delete old photo if exists
            if professional.photo:
                professional.photo.delete(save=False)

            # Save new photo
            professional.photo = photo_file
            professional.save()

            # Return success response with photo URL
            return Response({
                'message': 'Foto atualizada com sucesso',
                'photo_url': professional.photo_url
            }, status=status.HTTP_200_OK)

        except Exception as e:
            # Log the error for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f'Error uploading photo: {str(e)}', exc_info=True)
            return Response(
                {'error': f'Erro ao fazer upload: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], url_path='cities/(?P<state>[A-Za-z]{2})')
    def cities(self, request, state=None):
        """
        GET /api/professionals/cities/{state}/
        Returns list of cities for a given Brazilian state
        
        Args:
            state: Two-letter state code (e.g., 'SP', 'RJ', 'MG') - case insensitive
        
        Returns:
            List of city names for the state, sorted alphabetically
        """
        if not state or len(state) != 2:
            return Response(
                {'error': 'State code must be 2 characters (e.g., SP, RJ)'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate state code
        valid_states = [
            'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
            'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
            'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
        ]
        
        state_upper = state.upper()
        if state_upper not in valid_states:
            return Response(
                {'error': f'Invalid state code: {state}. Valid codes: {", ".join(valid_states)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get cities from database
        cities = City.objects.filter(state=state_upper).values_list('name', flat=True)
        
        if not cities.exists():
            return Response(
                {'error': f'No cities found for state: {state_upper}'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Sort using Python's sorted() to handle Unicode characters correctly
        sorted_cities = sorted(cities)
        
        return Response({
            'state': state_upper,
            'cities': sorted_cities,
            'count': len(sorted_cities)
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def password_reset(self, request):
        """
        POST /api/v1/professionals/password_reset/
        Solicita reset de senha via email
        
        Request:
        {
            "email": "user@example.com"
        }
        
        Response:
        {
            "detail": "Se este email estiver cadastrado, você receberá um link de reset"
        }
        """
        serializer = PasswordResetRequestSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(
                {'detail': 'Se este email estiver cadastrado, você receberá um link de reset de senha'},
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def password_reset_confirm(self, request):
        """
        POST /api/v1/professionals/password_reset_confirm/
        Confirma reset de senha com novo password
        
        Request:
        {
            "token": "abc123...",
            "password": "NovaSenh@123",
            "password_confirm": "NovaSenh@123"
        }
        
        Response:
        {
            "detail": "Senha atualizada com sucesso"
        }
        """
        serializer = PasswordResetConfirmSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {'detail': 'Senha atualizada com sucesso'},
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

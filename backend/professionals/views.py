"""
Views for the professionals app.
Implements API endpoints for professional profiles.

DEPLOYMENT: 2025-11-20 - Email validation & password reset fixes
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

    def get_queryset(self):
        """
        Return only professionals whose users have verified their email (is_active=True)
        This prevents unverified accounts from appearing in the listing.
        Uses select_related() to avoid N+1 query problem with user__is_active filter.
        """
        return Professional.objects.select_related('user').filter(user__is_active=True)

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

    def destroy(self, request, *args, **kwargs):
        """
        DELETE /api/professionals/{id}/
        Delete professional account AND associated user account
        This ensures email can be reused after account deletion
        """
        try:
            professional = self.get_object()
            user = professional.user
            
            # Delete the professional profile and user together
            professional.delete()
            user.delete()
            
            return Response(
                {'message': 'Conta deletada com sucesso'},
                status=status.HTTP_204_NO_CONTENT
            )
        except Professional.DoesNotExist:
            return Response(
                {'error': 'Profissional não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

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
        Creates user account and sends verification email.
        User must verify email before they can login.
        NOTE: Does NOT return JWT tokens - user must verify email first, then login
        """
        from django.db import IntegrityError
        
        serializer = ProfessionalCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                professional = serializer.save()
                
                # NOTE: We do NOT generate JWT tokens here
                # User must verify email first via /verify-email/
                # Then login via /login/ to get tokens
                
                return Response(
                    {
                        'message': 'Profissional criado com sucesso. Verifique seu email para ativar a conta.',
                        'email': professional.user.email,
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
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            serializer = EmailVerificationSerializer(data=request.data)
            if serializer.is_valid():
                token = serializer.validated_data['token']
                    
                email_token, result = EmailVerificationToken.verify_token(token)
                
                    
                if result == 'verified':
                    # CRITICAL: Refresh from DB to ensure we have latest state
                    email_token.refresh_from_db()
                    email_token.user.refresh_from_db()
                    
                                                    
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
        
        except Exception as e:
            logger.exception(f'[verify_email] 📋 Full traceback:')
            return Response({
                'error': 'Erro interno ao verificar email'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
                email_token = EmailVerificationToken.create_token(user)
                
                # Send verification email with token-based verification flow
                try:
                    from django.core.mail import send_mail
                    from django.conf import settings
                    import logging
                    logger = logging.getLogger(__name__)
                    
                    # Token-based verification: send token as plain text with HTML styling
                    verification_token = email_token.token
                    email_body = f"""<html>
<head>
  <style>
    body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }}
    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f6f8f7; }}
    .card {{ background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
    .header {{ text-align: center; margin-bottom: 30px; }}
    .logo {{ font-size: 28px; font-weight: bold; color: #10b981; margin-bottom: 10px; }}
    .title {{ font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 20px; }}
    .content {{ margin-bottom: 25px; }}
    .content p {{ margin: 10px 0; }}
    .token-section {{ background: #f3fdf5; border-left: 4px solid #10b981; padding: 15px; border-radius: 4px; margin: 20px 0; }}
    .token-label {{ font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-bottom: 8px; }}
    .token {{ 
      background: white; 
      padding: 12px; 
      border-radius: 4px; 
      font-family: 'Courier New', monospace; 
      font-size: 14px; 
      font-weight: 600;
      word-break: break-all;
      color: #10b981;
      border: 1px solid #d1fae5;
      text-align: center;
    }}
    .instruction {{ font-size: 14px; color: #6b7280; margin-top: 12px; }}
    .expiry {{ background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 4px; margin: 15px 0; font-size: 13px; color: #92400e; }}
    .footer {{ text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="logo">🌿 HolisticMatch</div>
        <h1 class="title">Novo Código de Verificação</h1>
      </div>
      
      <div class="content">
        <p>Olá,</p>
        <p>Aqui está seu novo código de verificação de email para o <strong>HolisticMatch</strong>.</p>
        
        <div class="token-section">
          <div class="token-label">Seu código de verificação:</div>
          <div class="token">{verification_token}</div>
          <div class="instruction">👉 Copie o código acima e cole na página de verificação</div>
        </div>

        <p><strong>Como verificar seu email:</strong></p>
        <ol>
          <li>Copie o código acima</li>
          <li>Cole o código no campo de verificação</li>
          <li>Clique em "Verificar E-mail"</li>
        </ol>

        <div class="expiry">
          ⏱️ Este código expira em <strong>24 horas</strong>.
        </div>
      </div>

      <div class="footer">
        <p>© 2025 HolisticMatch. Todos os direitos reservados.</p>
        <p>Dúvidas? Responda este email ou entre em contato conosco.</p>
      </div>
    </div>
  </div>
</body>
</html>"""
                    
                    # Send HTML email for tracking
                    from django.core.mail import EmailMultiAlternatives
                    email_message = EmailMultiAlternatives(
                        subject='Verifique seu email - HolisticMatch',
                        body=f'Código de verificação: {verification_token}\n\nCopie este código e cole na página de verificação.\n\nEste código expira em 24 horas.',
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        to=[email],
                    )
                    email_message.attach_alternative(email_body, "text/html")
                    email_message.send(fail_silently=False)
                except Exception:
                    pass
                
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
        import logging
        logger = logging.getLogger(__name__)
        
        serializer = PasswordResetRequestSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                serializer.save()
                logger.info(f"✅ Password reset requested for email: {request.data.get('email')}")
            except Exception as e:
                logger.error(f"❌ Error in password_reset.save(): {str(e)}", exc_info=True)
                return Response(
                    {'detail': 'Erro ao processar solicitação. Por favor, tente novamente.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            return Response(
                {'detail': 'Se este email estiver cadastrado, você receberá um link de reset de senha'},
                status=status.HTTP_200_OK
            )
        
        logger.error(f"Validation errors: {serializer.errors}")
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

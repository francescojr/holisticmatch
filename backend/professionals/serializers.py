"""
Serializers for the professionals app.
Handles API request/response serialization with comprehensive validation.
"""
from rest_framework import serializers
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import EmailMessage
from django.conf import settings
from .models import Professional
from .validators import (
    validate_name,
    validate_bio,
    validate_services,
    validate_price_per_session,
    validate_phone_number,
    validate_state_code,
    validate_profile_photo,
)
from .constants import SERVICE_TYPES
import logging

logger = logging.getLogger('professionals')


class UserSerializer(serializers.ModelSerializer):
    """Nested serializer for user data"""
    class Meta:
        model = User
        fields = ['id', 'email', 'username']
        read_only_fields = ['id']


class ProfessionalSerializer(serializers.ModelSerializer):
    """
    Serializer for Professional model
    Handles list and detail views with validation
    """
    user = UserSerializer(read_only=True)
    photo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Professional
        fields = [
            'id',
            'user',
            'name',
            'bio',
            'services',
            'city',
            'state',
            'price_per_session',
            'attendance_type',
            'whatsapp',
            'email',
            'phone',
            'photo',
            'photo_url',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'photo_url']
    
    def get_photo_url(self, obj):
        """Get photo URL or None"""
        return obj.photo_url
    
    def validate_name(self, value):
        """Validate professional name using custom validator"""
        try:
            validate_name(value)
            return value
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message)
    
    def validate_bio(self, value):
        """Validate professional bio using custom validator"""
        try:
            validate_bio(value)
            return value
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message)
    
    def validate_services(self, value):
        """Validate services using custom validator"""
        try:
            validate_services(value)
            return value
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message)
    
    def validate_price_per_session(self, value):
        """Validate price using custom validator"""
        try:
            validate_price_per_session(value)
            return value
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message)
    
    def validate_whatsapp(self, value):
        """Validate whatsapp number using custom validator"""
        if value:  # Only validate if provided
            try:
                validate_phone_number(value)
                return value
            except DjangoValidationError as e:
                raise serializers.ValidationError(f'WhatsApp: {e.message}')
        return value
    
    def validate_phone(self, value):
        """Validate phone number using custom validator"""
        if value:  # Only validate if provided
            try:
                validate_phone_number(value)
                return value
            except DjangoValidationError as e:
                raise serializers.ValidationError(f'Telefone: {e.message}')
        return value
    
    def validate_state(self, value):
        """Validate state code using custom validator"""
        try:
            return validate_state_code(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message)
    
    def validate(self, data):
        """Cross-field validation"""
        # Validate that whatsapp and phone are different if both provided
        whatsapp = data.get('whatsapp')
        phone = data.get('phone')
        
        if whatsapp and phone and whatsapp == phone:
            raise serializers.ValidationError({
                'phone': 'Telefone e WhatsApp devem ser diferentes',
                'whatsapp': 'Telefone e WhatsApp devem ser diferentes'
            })
        
        # Validate city and state pair
        city = data.get('city')
        state = data.get('state')
        
        if city and state:
            from .validators import validate_city_state_pair
            try:
                validate_city_state_pair(city, state)
            except DjangoValidationError as e:
                raise serializers.ValidationError({
                    'city': str(e.message),
                    'state': str(e.message)
                })
        
        # Email is required in the model, so no need to validate contact methods
        # The email field will be validated by Django's EmailField
        
        # Validate city and state consistency
        city = data.get('city')
        state = data.get('state')
        if city and state:
            # Could add more sophisticated validation here if needed
            # For now, just ensure both are provided together
            pass
        
        return data


class ProfessionalSummarySerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for list views
    Only includes essential fields for cards
    """
    photo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Professional
        fields = [
            'id',
            'name',
            'services',
            'city',
            'state',
            'price_per_session',
            'attendance_type',
            'photo_url',
        ]
    
    def get_photo_url(self, obj):
        """Get photo URL or None"""
        return obj.photo_url


class ProfessionalCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating professional profiles with user registration
    Handles password field and automatic user creation
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8,
        help_text='Mínimo 8 caracteres com maiúscula e número'
    )
    
    # Allow frontend to send 'full_name' instead of 'name'
    # This is write_only and not a model field
    full_name = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True
    )
    
    # CRITICAL: Explicit ImageField declaration for proper FormData handling
    # This ensures DRF properly validates multipart/form-data uploads
    photo = serializers.ImageField(
        required=False,
        allow_null=True,
        allow_empty_file=False,
        help_text='Foto de perfil (JPG ou PNG, máx 5MB)',
        error_messages={
            'invalid_image': 'Envie uma imagem válida (JPG ou PNG)',
            'required': 'Foto é obrigatória',
            'not_a_file': 'Foto precisa ser um arquivo de imagem',
        }
    )
    
    class Meta:
        model = Professional
        fields = [
            'name',
            'full_name',  # Accept both name and full_name
            'bio',
            'services',
            'city',
            'state',
            'price_per_session',
            'attendance_type',
            'whatsapp',
            'email',
            'phone',
            'password',
            'photo',
        ]
    
    def to_internal_value(self, data):
        """
        Handle JSON-encoded fields from FormData
        When FormData is sent, complex fields like 'services' come as JSON strings
        Map 'full_name' to 'name' for frontend compatibility
        """
        import json
        import logging
        
        logger = logging.getLogger(__name__)
        
        # Make a mutable copy of QueryDict to avoid immutability issues
        if hasattr(data, 'dict'):  # QueryDict
            data = data.dict()
        else:
            # Create a mutable copy of regular dicts/objects
            data = dict(data) if not isinstance(data, dict) else data
        
        # Map full_name to name if full_name provided
        if 'full_name' in data and data['full_name']:
            data['name'] = data.pop('full_name')
            logger.debug(f'Mapped full_name to name: {data["name"]}')
        elif 'full_name' in data:
            # Remove empty full_name
            data.pop('full_name')
        
        # Parse JSON fields that come from FormData
        if 'services' in data and isinstance(data['services'], str):
            try:
                data['services'] = json.loads(data['services'])
                logger.debug(f'Parsed services from JSON string: {data["services"]}')
            except (json.JSONDecodeError, ValueError) as e:
                logger.error(f'Failed to parse services JSON: {str(e)}')
                # Don't modify - let validator handle the error
        
        # Call parent to process
        return super().to_internal_value(data)
    
    def validate_password(self, value):
        """Validate password strength"""
        if len(value) < 8:
            raise serializers.ValidationError('Senha deve ter pelo menos 8 caracteres')
        if not any(c.isupper() for c in value):
            raise serializers.ValidationError('Senha deve conter uma letra maiúscula')
        if not any(c.isdigit() for c in value):
            raise serializers.ValidationError('Senha deve conter um número')
        return value
    
    def validate_name(self, value):
        """Validate professional name"""
        try:
            validate_name(value)
            return value
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message)
    
    def validate_bio(self, value):
        """Validate bio"""
        try:
            validate_bio(value)
            return value
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message)
    
    def validate_photo(self, value):
        """
        Validate photo field explicitly
        This method is called AFTER ImageField parsing
        """
        if value:  # Only validate if provided
            try:
                validate_profile_photo(value)
                return value
            except DjangoValidationError as e:
                raise serializers.ValidationError(str(e))
        else:
            return value
    
    def validate_services(self, value):
        """Validate services"""
        try:
            validate_services(value)
            return value
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message)
    
    def validate_state(self, value):
        """Validate state"""
        try:
            return validate_state_code(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message)
    
    def validate_email(self, value):
        """Validate email is unique (not already registered)"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Este email já está registrado')
        return value
    
    def validate(self, data):
        """Cross-field validation including city-state pair"""
        # Validate city and state pair
        city = data.get('city')
        state = data.get('state')
        
        if city and state:
            from .validators import validate_city_state_pair
            try:
                validate_city_state_pair(city, state)
            except DjangoValidationError as e:
                raise serializers.ValidationError({
                    'city': str(e.message),
                    'state': str(e.message)
                })
        
        return data
    
    def create(self, validated_data):
        """Create professional with associated user and send verification email"""
        from .models import EmailVerificationToken
        from django.core.mail import send_mail
        from django.conf import settings
        import logging
        
        logger = logging.getLogger(__name__)
        
        password = validated_data.pop('password')
        email = validated_data['email']
        
        logger.info(f'🔄 Starting professional registration for email: {email}')
        
        try:
            # Create user account (initially inactive until email verified)
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                is_active=False  # User starts inactive until email verification
            )
            logger.info(f'✅ User created: {email} (is_active=False)')
            
            # Create professional profile
            professional = Professional.objects.create(
                user=user,
                **validated_data
            )
            logger.info(f'✅ Professional profile created for {email}')
            
            # Create email verification token
            email_token = EmailVerificationToken.create_token(user)
            logger.info(f'✅ Email verification token created: {email_token.token[:20]}...')
            
            # Send verification email with token-based verification flow
            try:
                # Log email configuration
                logger.info(f'📧 Email Backend: {settings.EMAIL_BACKEND}')
                logger.info(f'📧 From Email: {settings.DEFAULT_FROM_EMAIL}')
                logger.info(f'📧 Recipient: {email}')
                logger.info(f'� Verification Token: {email_token.token[:20]}...')
                
                # Log Resend API key status
                if hasattr(settings, 'RESEND_API_KEY'):
                    key_status = '✅ CONFIGURED' if settings.RESEND_API_KEY else '❌ NOT SET'
                    logger.info(f'🔑 RESEND_API_KEY: {key_status}')
                else:
                    logger.warning(f'⚠️ RESEND_API_KEY not in settings')
                
                logger.info(f'📤 Attempting to send verification email...')
                
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
    .button {{ display: inline-block; background: #10b981; color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; margin: 15px 0; font-weight: 600; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="logo">🌿 HolisticMatch</div>
        <h1 class="title">Bem-vindo!</h1>
      </div>
      
      <div class="content">
        <p>Olá,</p>
        <p>Obrigado por se registrar no <strong>HolisticMatch</strong>! Para começar, você precisa verificar seu endereço de email.</p>
        
        <div class="token-section">
          <div class="token-label">Seu código de verificação:</div>
          <div class="token">{verification_token}</div>
          <div class="instruction">👉 Copie o código acima e cole na página de verificação</div>
        </div>

        <p><strong>Como verificar seu email:</strong></p>
        <ol>
          <li>Copie o código acima</li>
          <li>Abra <a href="https://holisticmatch.vercel.app/verify-email" style="color: #10b981;">https://holisticmatch.vercel.app/verify-email</a></li>
          <li>Cole o código no campo de verificação</li>
          <li>Clique em "Verificar E-mail"</li>
        </ol>

        <div class="expiry">
          ⏱️ Este código expira em <strong>24 horas</strong>. Se não receber, pode solicitar um novo na página de verificação.
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
                
                # Simple text email - Resend backend will handle it
                from django.core.mail import send_mail
                send_mail(
                    subject='Verifique seu email - HolisticMatch',
                    message=f'Código de verificação: {verification_token}\n\nCopie este código e cole na página de verificação.\n\nEste código expira em 5 minutos.',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    fail_silently=False,
                )
                logger.info(f'✅ Verification email sent successfully to {email}')
            except Exception as e:
                logger.error(f'❌ Failed to send verification email to {email}', exc_info=True)
                logger.error(f'Error type: {type(e).__name__}')
                logger.error(f'Error message: {str(e)}')
                # Continue - user can request email resend later
            
            return professional
            
        except Exception as e:
            logger.error(f'❌ Error in professional creation: {str(e)}', exc_info=True)
            logger.error(f'Error type: {type(e).__name__}')
            raise


class EmailVerificationSerializer(serializers.Serializer):
    """
    Serializer for email verification token validation
    """
    token = serializers.CharField(required=True, write_only=True)
    
    def validate_token(self, value):
        """Validate that token exists and is valid"""
        from .models import EmailVerificationToken
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f'[EmailVerificationSerializer.validate_token] 🔍 Validating token: {value[:20]}...')
        
        try:
            email_token = EmailVerificationToken.objects.get(token=value)
            logger.info(f'[EmailVerificationSerializer.validate_token] ✅ Token found')
            logger.info(f'[EmailVerificationSerializer.validate_token] 📊 is_verified: {email_token.is_verified}')
            logger.info(f'[EmailVerificationSerializer.validate_token] 📊 is_expired(): {email_token.is_expired()}')
            logger.info(f'[EmailVerificationSerializer.validate_token] 📊 is_valid(): {email_token.is_valid()}')
            
            # Check if already verified - if so, allow it (don't block)
            if email_token.is_verified:
                logger.info(f'[EmailVerificationSerializer.validate_token] ⚠️ Token already verified - allowing anyway')
                return value
            
            # Check if expired
            if email_token.is_expired():
                logger.warning(f'[EmailVerificationSerializer.validate_token] ⏰ Token expired')
                raise serializers.ValidationError('Token expirado')
            
            logger.info(f'[EmailVerificationSerializer.validate_token] ✅ Token is valid')
            return value
        except EmailVerificationToken.DoesNotExist:
            logger.error(f'[EmailVerificationSerializer.validate_token] ❌ Token not found')
            raise serializers.ValidationError('Token inválido')


class ResendVerificationEmailSerializer(serializers.Serializer):
    """
    Serializer for resending verification email
    """
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        """Check if email exists and user is not yet verified"""
        try:
            user = User.objects.get(email=value)
            if user.is_active:
                raise serializers.ValidationError('Este email já foi verificado')
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError('Email não encontrado')


class CitySerializer(serializers.Serializer):
    """
    Serializer for city data
    Simple serialization of city names for dropdowns
    """
    name = serializers.CharField()
    state = serializers.CharField()
    
    def to_representation(self, instance):
        """Return just the city name for dropdown display"""
        return instance.name


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer for password reset request
    Solicita reset de senha via email
    """
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        """Valida se email existe no sistema"""
        try:
            User.objects.get(email=value)
        except User.DoesNotExist:
            # Não revelar se email existe (segurança)
            pass
        return value

    def save(self):
        """Cria token e envia email"""
        email = self.validated_data['email']
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return None

        # Importar model aqui para evitar circular imports
        from .models import PasswordResetToken

        # Remover token antigo se existir
        PasswordResetToken.objects.filter(user=user).delete()

        # Criar novo token
        reset_token = PasswordResetToken.create_token(user)

        # Enviar email
        self._send_reset_email(user, reset_token)

        return reset_token

    def _send_reset_email(self, user, reset_token):
        """Envia email com link de reset"""
        from django.core.mail import send_mail
        from django.conf import settings

        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token.token}"
        
        subject = "HolisticMatch - Redefinir Senha"
        message = f"""
Olá {user.first_name or user.username},

Você solicitou para redefinir sua senha. Clique no link abaixo:

{reset_url}

Este link expira em 24 horas.

Se você não solicitou isso, ignore este email.

Atenciosamente,
Equipe HolisticMatch
        """

        try:
            send_mail(
                subject,
                message,
                settings.EMAIL_HOST_USER,
                [user.email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Erro ao enviar email: {e}")


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer para confirmar reset de senha com novo password
    Valida token e atualiza password
    """
    token = serializers.CharField(required=True, max_length=255)
    password = serializers.CharField(
        required=True,
        write_only=True,
        min_length=8,
        help_text="Mínimo 8 caracteres, com letra maiúscula e número"
    )
    password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        min_length=8
    )

    def validate(self, data):
        """Validações customizadas"""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Senhas não conferem'
            })

        # Validar força da senha
        if not any(c.isupper() for c in data['password']):
            raise serializers.ValidationError({
                'password': 'Senha deve conter pelo menos uma letra maiúscula'
            })

        if not any(c.isdigit() for c in data['password']):
            raise serializers.ValidationError({
                'password': 'Senha deve conter pelo menos um dígito'
            })

        return data

    def validate_token(self, value):
        """Valida se token existe e é válido"""
        from .models import PasswordResetToken
        try:
            reset_token = PasswordResetToken.objects.get(token=value)
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError('Token inválido ou expirado')

        if not reset_token.is_valid():
            raise serializers.ValidationError('Token expirado ou já utilizado')

        return value

    def save(self):
        """Atualiza senha e marca token como utilizado"""
        from .models import PasswordResetToken
        
        token_str = self.validated_data['token']
        password = self.validated_data['password']

        reset_token = PasswordResetToken.objects.get(token=token_str)
        user = reset_token.user

        # Atualizar senha
        user.set_password(password)
        user.save(update_fields=['password'])

        # Marcar token como utilizado
        reset_token.mark_as_used()

        return user



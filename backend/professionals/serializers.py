"""
Serializers for the professionals app.
Handles API request/response serialization with comprehensive validation.
"""
from rest_framework import serializers
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import Professional
from .validators import (
    validate_name,
    validate_bio,
    validate_services,
    validate_price_per_session,
    validate_phone_number,
    validate_state_code,
)
from .constants import SERVICE_TYPES


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
    
    class Meta:
        model = Professional
        fields = [
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
            'password',
            'photo',
        ]
    
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
        from django.urls import reverse
        
        password = validated_data.pop('password')
        email = validated_data['email']
        
        # Create user account (initially inactive until email verified)
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            is_active=False  # User starts inactive until email verification
        )
        
        # Create professional profile
        professional = Professional.objects.create(
            user=user,
            **validated_data
        )
        
        # Create email verification token
        email_token = EmailVerificationToken.create_token(user, expiry_hours=24)
        
        # Send verification email
        try:
            verification_link = f"{self.context.get('request').build_absolute_uri('/')}" if self.context.get('request') else "http://localhost:3000"
            verification_link = verification_link.rstrip('/') + f"/verify-email/{email_token.token}"
            
            send_mail(
                subject='Verifique seu email - HolisticMatch',
                message=f'Clique no link para verificar seu email: {verification_link}',
                from_email='noreply@holisticmatch.com',
                recipient_list=[email],
                fail_silently=False,
            )
        except Exception as e:
            # Log error but don't fail registration
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f'Failed to send verification email to {email}: {str(e)}')
        
        return professional


class EmailVerificationSerializer(serializers.Serializer):
    """
    Serializer for email verification token validation
    """
    token = serializers.CharField(required=True, write_only=True)
    
    def validate_token(self, value):
        """Validate that token exists and is valid"""
        from .models import EmailVerificationToken
        
        try:
            email_token = EmailVerificationToken.objects.get(token=value)
            if not email_token.is_valid():
                if email_token.is_expired():
                    raise serializers.ValidationError('Token expirado')
                elif email_token.is_verified:
                    raise serializers.ValidationError('Email já foi verificado')
            return value
        except EmailVerificationToken.DoesNotExist:
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


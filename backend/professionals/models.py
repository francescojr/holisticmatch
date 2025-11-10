"""
Models for the professionals app.
Defines the Professional model for holistic therapy service providers.
"""
import uuid
import secrets
from datetime import timedelta
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from django.conf import settings
from django.utils import timezone
from storage.backends import ProfilePhotoStorage
from .validators import (
    validate_name,
    validate_bio,
    validate_services,
    validate_price_per_session,
    validate_profile_photo,
    validate_state_code,
    validate_phone_number,
)


class City(models.Model):
    """
    Brazilian city model for location management
    Stores city names mapped to Brazilian states
    """
    state = models.CharField(max_length=2)  # BR state code (SP, RJ, etc.)
    name = models.CharField(max_length=100)
    
    class Meta:
        ordering = ['state', 'name']
        unique_together = ('state', 'name')
        indexes = [
            models.Index(fields=['state']),
            models.Index(fields=['name']),
            models.Index(fields=['state', 'name']),
        ]
        verbose_name_plural = 'Cities'
    
    def __str__(self):
        return f"{self.name}/{self.state}"


class Professional(models.Model):
    """
    Professional profile model
    Stores holistic therapy professional information
    """
    ATTENDANCE_CHOICES = (
        ('presencial', 'Presencial'),
        ('online', 'Online'),
        ('ambos', 'Ambos'),
    )
    
    # Core fields
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='professional'
    )
    name = models.CharField(max_length=255, validators=[validate_name])
    bio = models.TextField(validators=[validate_bio])
    
    # Services (stored as JSON array)
    services = models.JSONField(default=list, validators=[validate_services])
    
    # Location
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=2, validators=[validate_state_code])  # BR state code (SP, RJ, etc.)
    
    # Pricing
    price_per_session = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[validate_price_per_session]
    )
    
    # Attendance type
    attendance_type = models.CharField(
        max_length=20,
        choices=ATTENDANCE_CHOICES,
        default='presencial'
    )
    
    # Contact information
    whatsapp = models.CharField(max_length=20, blank=True, validators=[validate_phone_number])
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, validators=[validate_phone_number])
    
    # Profile photo
    photo = models.ImageField(
        upload_to='photos/',
        blank=True,
        null=True,
        storage=ProfilePhotoStorage() if settings.USE_S3 else None,
        validators=[validate_profile_photo]
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['city']),
            models.Index(fields=['state']),
            models.Index(fields=['price_per_session']),
            models.Index(fields=['attendance_type']),
        ]
    
    def __str__(self):
        return self.name
    
    
    @property
    def photo_url(self):
        """Get photo URL or None"""
        if self.photo:
            return self.photo.url
        return None


class EmailVerificationToken(models.Model):
    """
    Email verification token model
    Stores one-time tokens for email verification during registration
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='email_verification_token'
    )
    token = models.CharField(
        max_length=255,
        unique=True
    )
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['token']),
            models.Index(fields=['user']),
            models.Index(fields=['is_verified']),
        ]
    
    def __str__(self):
        return f"Email verification token for {self.user.email}"
    
    def is_valid(self):
        """Check if token is still valid (not expired and not verified)"""
        return not self.is_verified and timezone.now() < self.expires_at
    
    def is_expired(self):
        """Check if token has expired"""
        return timezone.now() > self.expires_at
    
    @classmethod
    def create_token(cls, user, expiry_minutes=5):
        """Create or update verification token for user"""
        expires_at = timezone.now() + timedelta(minutes=expiry_minutes)
        token_string = secrets.token_urlsafe(32)
        token, created = cls.objects.update_or_create(
            user=user,
            defaults={
                'token': token_string,
                'expires_at': expires_at,
                'is_verified': False
            }
        )
        return token
    
    @classmethod
    def verify_token(cls, token):
        """Verify token and mark email as verified"""
        from django.db import transaction
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f'[EmailVerificationToken.verify_token] 🔍 Looking for token: {token[:20]}...')
        
        try:
            email_token = cls.objects.get(token=token)
            logger.info(f'[EmailVerificationToken.verify_token] ✅ Token found in DB')
            logger.info(f'[EmailVerificationToken.verify_token] 📧 User: {email_token.user.email}')
            logger.info(f'[EmailVerificationToken.verify_token] is_verified: {email_token.is_verified}')
            logger.info(f'[EmailVerificationToken.verify_token] is_expired(): {email_token.is_expired()}')
            logger.info(f'[EmailVerificationToken.verify_token] is_valid(): {email_token.is_valid()}')
            
            # Check if expired
            if email_token.is_expired():
                logger.warning(f'[EmailVerificationToken.verify_token] ❌ Token expired')
                return None, 'invalid_or_expired'
            
            # If already verified, that's OK - user is trying to verify again
            # This is allowed - just return success without re-saving
            if email_token.is_verified:
                logger.info(f'[EmailVerificationToken.verify_token] ℹ️ Token already verified')
                email_token.refresh_from_db()
                email_token.user.refresh_from_db()
                logger.info(f'[EmailVerificationToken.verify_token] 🔑 User is_active: {email_token.user.is_active}')
                return email_token, 'verified'
            
            # Use atomic transaction to ensure both updates are saved together
            with transaction.atomic():
                logger.info(f'[EmailVerificationToken.verify_token] 🔄 Starting atomic transaction')
                
                logger.info(f'[EmailVerificationToken.verify_token] 🔄 Setting is_verified=True')
                email_token.is_verified = True
                email_token.save()
                logger.info(f'[EmailVerificationToken.verify_token] ✅ Token marked as verified')
                
                # Mark user email as verified
                logger.info(f'[EmailVerificationToken.verify_token] 🔄 Setting user.is_active=True')
                email_token.user.is_active = True
                email_token.user.save()
                logger.info(f'[EmailVerificationToken.verify_token] ✅ User marked as active')
                
                logger.info(f'[EmailVerificationToken.verify_token] 🎉 Transaction committed successfully')
            
            # CRITICAL FIX: Reload objects from database after transaction
            # The objects in memory may be stale/cached
            email_token.refresh_from_db()
            email_token.user.refresh_from_db()
            logger.info(f'[EmailVerificationToken.verify_token] 🔄 Reloaded from DB - is_active: {email_token.user.is_active}')
            
            return email_token, 'verified'
        except cls.DoesNotExist:
            logger.error(f'[EmailVerificationToken.verify_token] ❌ Token not found in DB')
            return None, 'not_found'


class PasswordResetToken(models.Model):
    """
    Password reset token model
    Stores one-time tokens for password recovery
    Expires after 24 hours
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='password_reset_token'
    )
    token = models.CharField(
        max_length=255,
        unique=True,
        default=uuid.uuid4
    )
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['token']),
            models.Index(fields=['user']),
            models.Index(fields=['expires_at']),
        ]
        verbose_name = 'Password Reset Token'
        verbose_name_plural = 'Password Reset Tokens'

    def __str__(self):
        return f"Password reset token for {self.user.email}"

    def is_valid(self):
        """Check if token is still valid (not expired and not used)"""
        return not self.is_used and timezone.now() < self.expires_at

    def is_expired(self):
        """Check if token has expired"""
        return timezone.now() > self.expires_at

    def mark_as_used(self):
        """Mark token as used to prevent reuse"""
        self.is_used = True
        self.save(update_fields=['is_used'])

    @classmethod
    def create_token(cls, user, expiry_hours=24):
        """Create or update password reset token for user"""
        expires_at = timezone.now() + timedelta(hours=expiry_hours)
        token_string = secrets.token_urlsafe(32)
        token, created = cls.objects.update_or_create(
            user=user,
            defaults={
                'token': token_string,
                'expires_at': expires_at,
                'is_used': False
            }
        )
        return token

    @classmethod
    def verify_and_reset(cls, token, new_password):
        """Verify token and reset password"""
        try:
            reset_token = cls.objects.get(token=token)
            if not reset_token.is_valid():
                return None, 'invalid_or_expired'

            # Update password
            user = reset_token.user
            user.set_password(new_password)
            user.save()

            # Mark token as used
            reset_token.mark_as_used()

            return user, 'reset_success'
        except cls.DoesNotExist:
            return None, 'not_found'


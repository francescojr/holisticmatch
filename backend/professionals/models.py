"""
Models for the professionals app.
Defines the Professional model for holistic therapy service providers.
"""
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from django.conf import settings
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

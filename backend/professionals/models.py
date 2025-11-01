"""
Models for the professionals app.
Defines the Professional model for holistic therapy service providers.
"""
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator


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
    name = models.CharField(max_length=255)
    bio = models.TextField()
    
    # Services (stored as JSON array)
    services = models.JSONField(default=list)
    
    # Location
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=2)  # BR state code (SP, RJ, etc.)
    
    # Pricing
    price_per_session = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    
    # Attendance type
    attendance_type = models.CharField(
        max_length=20,
        choices=ATTENDANCE_CHOICES,
        default='presencial'
    )
    
    # Contact information
    whatsapp = models.CharField(max_length=20, blank=True)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    
    # Profile photo
    photo = models.ImageField(
        upload_to='photos/',
        blank=True,
        null=True
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

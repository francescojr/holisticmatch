"""
Serializers for the professionals app.
Handles API request/response serialization.
"""
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Professional
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
    
    def validate_services(self, value):
        """Validate services are from allowed list"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Services must be a list")
        
        if not value:
            raise serializers.ValidationError("At least one service is required")
        
        # Validate each service is in the allowed list
        invalid_services = [s for s in value if s not in SERVICE_TYPES]
        if invalid_services:
            raise serializers.ValidationError(
                f"Invalid services: {', '.join(invalid_services)}"
            )
        
        return value
    
    def validate_price_per_session(self, value):
        """Validate price is positive"""
        if value < 0:
            raise serializers.ValidationError("Price must be positive")
        
        if value > 10000:
            raise serializers.ValidationError("Price seems too high")
        
        return value
    
    def validate_state(self, value):
        """Validate Brazilian state code"""
        if len(value) != 2:
            raise serializers.ValidationError("State must be 2-letter code")
        
        return value.upper()


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

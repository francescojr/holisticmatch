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

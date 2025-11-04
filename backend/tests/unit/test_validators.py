"""
Unit tests for professional model validators.
Tests all custom validation functions.
"""
import pytest
from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from professionals.validators import (
    validate_phone_number,
    validate_services,
    validate_price_per_session,
    validate_profile_photo,
    validate_state_code,
    validate_name,
    validate_bio,
)
from professionals.constants import SERVICE_TYPES


class TestPhoneNumberValidator:
    """Test phone number validation"""

    def test_valid_mobile_number(self):
        """Test valid Brazilian mobile numbers"""
        valid_numbers = [
            '11999999999',  # Mobile starting with 9
            '(11) 99999-9999',
            '11 99999 9999',
            '+5511999999999',
        ]
        for number in valid_numbers:
            validate_phone_number(number)  # Should not raise

    def test_valid_landline_number(self):
        """Test valid Brazilian landline numbers"""
        valid_numbers = [
            '1133334444',  # Landline 10 digits
            '(11) 3333-4444',
            '11 3333 4444',
        ]
        for number in valid_numbers:
            validate_phone_number(number)  # Should not raise

    def test_invalid_mobile_number(self):
        """Test invalid mobile numbers"""
        invalid_numbers = [
            '119999999999',  # Too long
            '02999999999',  # Invalid area code
            '999999999',  # Missing area code
            '119999999',  # Too short
        ]
        for number in invalid_numbers:
            with pytest.raises(ValidationError):
                validate_phone_number(number)

    def test_empty_value(self):
        """Test empty values are allowed"""
        validate_phone_number('')  # Should not raise
        validate_phone_number(None)  # Should not raise


class TestServicesValidator:
    """Test services validation"""

    def test_valid_services(self):
        """Test valid service lists"""
        valid_services = [
            ['Reiki'],
            ['Reiki', 'Acupuntura'],
            SERVICE_TYPES[:3],  # First 3 services
        ]
        for services in valid_services:
            validate_services(services)  # Should not raise

    def test_invalid_services(self):
        """Test invalid service lists"""
        invalid_cases = [
            [],  # Empty list
            ['Invalid Service'],  # Non-existent service
            ['Reiki'] * 11,  # Too many services
            ['Reiki', 'Reiki'],  # Duplicates
        ]
        for services in invalid_cases:
            with pytest.raises(ValidationError):
                validate_services(services)

    def test_non_list_input(self):
        """Test non-list inputs"""
        with pytest.raises(ValidationError):
            validate_services('Reiki')
        with pytest.raises(ValidationError):
            validate_services(None)


class TestPriceValidator:
    """Test price validation"""

    def test_valid_prices(self):
        """Test valid price ranges"""
        valid_prices = [10, 50, 100, 500, 5000]
        for price in valid_prices:
            validate_price_per_session(price)  # Should not raise

    def test_invalid_prices(self):
        """Test invalid prices"""
        invalid_prices = [0, -10, 5001, 10000]
        for price in invalid_prices:
            with pytest.raises(ValidationError):
                validate_price_per_session(price)


class TestProfilePhotoValidator:
    """Test photo validation"""

    def test_valid_photo(self):
        """Test valid photo files"""
        # Create a small valid JPEG
        valid_photo = ContentFile(b'fake image data', name='test.jpg')
        valid_photo.content_type = 'image/jpeg'
        valid_photo.size = 1024 * 1024  # 1MB

        validate_profile_photo(valid_photo)  # Should not raise

    def test_large_photo(self):
        """Test oversized photos"""
        large_photo = ContentFile(b'x' * (6 * 1024 * 1024), name='large.jpg')  # 6MB
        large_photo.content_type = 'image/jpeg'

        with pytest.raises(ValidationError, match='5MB'):
            validate_profile_photo(large_photo)

    def test_invalid_file_type(self):
        """Test invalid file types"""
        invalid_photo = ContentFile(b'fake data', name='test.txt')
        invalid_photo.content_type = 'text/plain'

        with pytest.raises(ValidationError, match='JPG ou PNG'):
            validate_profile_photo(invalid_photo)

    def test_empty_photo(self):
        """Test empty photo values"""
        validate_profile_photo(None)  # Should not raise
        validate_profile_photo('')  # Should not raise


class TestStateCodeValidator:
    """Test state code validation"""

    def test_valid_states(self):
        """Test valid Brazilian state codes"""
        valid_states = ['SP', 'RJ', 'MG', 'RS', 'SC', 'PR', 'ES']
        for state in valid_states:
            result = validate_state_code(state)
            assert result == state.upper()

    def test_invalid_states(self):
        """Test invalid state codes"""
        invalid_states = ['', 'XX', 'SPP', '123']
        for state in invalid_states:
            with pytest.raises(ValidationError):
                validate_state_code(state)


class TestNameValidator:
    """Test name validation"""

    def test_valid_names(self):
        """Test valid names"""
        valid_names = [
            'João Silva',
            'Maria Santos',
            'José da Silva',
            'Ana Paula',
            'ABC',  # Minimum length
        ]
        for name in valid_names:
            validate_name(name)  # Should not raise

    def test_invalid_names(self):
        """Test invalid names"""
        invalid_names = [
            '',  # Empty
            '  ',  # Whitespace only
            'AB',  # Too short
            'A' * 256,  # Too long
            'João123',  # Contains numbers
            'João@Silva',  # Special characters
        ]
        for name in invalid_names:
            with pytest.raises(ValidationError):
                validate_name(name)


class TestBioValidator:
    """Test bio validation"""

    def test_valid_bio(self):
        """Test valid bio texts"""
        valid_bio = 'A' * 50  # Minimum length
        validate_bio(valid_bio)  # Should not raise

        valid_bio = 'A' * 2000  # Maximum length
        validate_bio(valid_bio)  # Should not raise

    def test_invalid_bio(self):
        """Test invalid bio texts"""
        invalid_bios = [
            '',  # Empty
            '  ',  # Whitespace only
            'A' * 49,  # Too short
            'A' * 2001,  # Too long
        ]
        for bio in invalid_bios:
            with pytest.raises(ValidationError):
                validate_bio(bio)
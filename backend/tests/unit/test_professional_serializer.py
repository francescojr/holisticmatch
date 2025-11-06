"""
Unit tests for Professional serializer validations.
Tests serializer-level validation using custom validators.
"""
import pytest
from rest_framework import serializers
from professionals.serializers import ProfessionalSerializer
from professionals.constants import SERVICE_TYPES


@pytest.fixture
def valid_professional_data():
    """Valid professional data for serializer testing"""
    return {
        'name': 'João Silva',
        'bio': 'Profissional experiente em terapias holísticas com mais de 10 anos de experiência. Especializado em Reiki e meditação.',
        'services': ['Reiki', 'Acupuntura'],
        'city': 'São Paulo',
        'state': 'SP',
        'price_per_session': 150.00,
        'attendance_type': 'ambos',
        'whatsapp': '11999999999',
        'email': 'joao@example.com',
        'phone': '1133334444',
    }


@pytest.mark.django_db
class TestProfessionalSerializerValidation:
    """Test Professional serializer validations"""

    def test_valid_professional_serialization(self, valid_professional_data):
        """Test serializing valid professional data"""
        serializer = ProfessionalSerializer(data=valid_professional_data)
        assert serializer.is_valid(), f"Serializer errors: {serializer.errors}"

    def test_invalid_name_validation(self, valid_professional_data):
        """Test name validation errors"""
        invalid_names = [
            '',  # Empty
            'AB',  # Too short
            'A' * 256,  # Too long
            'João123',  # Invalid characters
        ]

        for invalid_name in invalid_names:
            data = valid_professional_data.copy()
            data['name'] = invalid_name
            serializer = ProfessionalSerializer(data=data)
            assert not serializer.is_valid()
            assert 'name' in serializer.errors

    def test_invalid_bio_validation(self, valid_professional_data):
        """Test bio validation errors"""
        invalid_bios = [
            '',  # Empty
            'A' * 49,  # Too short
            'A' * 2001,  # Too long
        ]

        for invalid_bio in invalid_bios:
            data = valid_professional_data.copy()
            data['bio'] = invalid_bio
            serializer = ProfessionalSerializer(data=data)
            assert not serializer.is_valid()
            assert 'bio' in serializer.errors

    def test_invalid_services_validation(self, valid_professional_data):
        """Test services validation errors"""
        invalid_services = [
            [],  # Empty list
            ['Invalid Service'],  # Non-existent service
            ['Reiki'] * 11,  # Too many services
        ]

        for invalid_service_list in invalid_services:
            data = valid_professional_data.copy()
            data['services'] = invalid_service_list
            serializer = ProfessionalSerializer(data=data)
            assert not serializer.is_valid()
            assert 'services' in serializer.errors

    def test_invalid_state_validation(self, valid_professional_data):
        """Test state code validation errors"""
        invalid_states = ['', 'XX', 'SPP', '123']

        for invalid_state in invalid_states:
            data = valid_professional_data.copy()
            data['state'] = invalid_state
            serializer = ProfessionalSerializer(data=data)
            assert not serializer.is_valid()
            assert 'state' in serializer.errors

    def test_invalid_price_validation(self, valid_professional_data):
        """Test price validation errors"""
        invalid_prices = [0, -10, 5001]

        for invalid_price in invalid_prices:
            data = valid_professional_data.copy()
            data['price_per_session'] = invalid_price
            serializer = ProfessionalSerializer(data=data)
            assert not serializer.is_valid()
            assert 'price_per_session' in serializer.errors

    def test_invalid_phone_validation(self, valid_professional_data):
        """Test phone number validation errors"""
        invalid_phones = ['119999999999', '02999999999', '999999999']

        for invalid_phone in invalid_phones:
            # Test whatsapp
            data = valid_professional_data.copy()
            data['whatsapp'] = invalid_phone
            serializer = ProfessionalSerializer(data=data)
            assert not serializer.is_valid()
            assert 'whatsapp' in serializer.errors

            # Test phone
            data2 = valid_professional_data.copy()
            data2['phone'] = invalid_phone
            serializer2 = ProfessionalSerializer(data=data2)
            assert not serializer2.is_valid()
            assert 'phone' in serializer2.errors

    def test_cross_field_validation_same_phone_whatsapp(self, valid_professional_data):
        """Test that whatsapp and phone cannot be the same"""
        data = valid_professional_data.copy()
        data['whatsapp'] = '11999999999'
        data['phone'] = '11999999999'  # Same as whatsapp

        serializer = ProfessionalSerializer(data=data)
        assert not serializer.is_valid()
        assert 'phone' in serializer.errors
        assert 'whatsapp' in serializer.errors

    def test_cross_field_validation_no_contact_method(self, valid_professional_data):
        """Test that email is required (model requirement)"""
        data = valid_professional_data.copy()
        data['email'] = ''  # Email is required in the model

        serializer = ProfessionalSerializer(data=data)
        assert not serializer.is_valid()
        # Email validation will be handled by Django's EmailField
        assert 'email' in serializer.errors

    @pytest.mark.django_db
    def test_optional_fields_allowed(self, valid_professional_data):
        """Test that optional fields work correctly"""
        # Test with empty phone/whatsapp
        data = valid_professional_data.copy()
        data['phone'] = ''
        data['whatsapp'] = ''
        serializer = ProfessionalSerializer(data=data)
        assert serializer.is_valid()

    @pytest.mark.django_db
    def test_case_insensitive_state_conversion(self, valid_professional_data):
        """Test state codes are converted to uppercase"""
        data = valid_professional_data.copy()
        data['state'] = 'sp'  # lowercase

        serializer = ProfessionalSerializer(data=data)
        assert serializer.is_valid()
        assert serializer.validated_data['state'] == 'SP'

    @pytest.mark.django_db
    def test_valid_services_all_types(self, valid_professional_data):
        """Test all valid service types are accepted"""
        data = valid_professional_data.copy()
        data['services'] = SERVICE_TYPES[:5]  # First 5 services

        serializer = ProfessionalSerializer(data=data)
        assert serializer.is_valid()

    @pytest.mark.django_db
    def test_duplicate_services_rejected(self, valid_professional_data):
        """Test duplicate services are rejected"""
        data = valid_professional_data.copy()
        data['services'] = ['Reiki', 'Reiki']  # Duplicates

        serializer = ProfessionalSerializer(data=data)
        assert not serializer.is_valid()
        assert 'services' in serializer.errors

    def test_professional_summary_serializer(self, valid_professional_data):
        """Test ProfessionalSummarySerializer serialization"""
        from professionals.serializers import ProfessionalSummarySerializer

        serializer = ProfessionalSummarySerializer(data=valid_professional_data)
        assert serializer.is_valid(), f"Serializer errors: {serializer.errors}"

        # Check that only summary fields are included
        expected_fields = ['id', 'name', 'services', 'city', 'state', 'price_per_session', 'attendance_type', 'photo_url']
        assert set(serializer.validated_data.keys()).issubset(set(expected_fields))

    @pytest.mark.django_db
    def test_get_photo_url_method(self, valid_professional_data):
        """Test get_photo_url method returns photo URL"""
        from professionals.serializers import ProfessionalSerializer, ProfessionalSummarySerializer

        # Test with ProfessionalSerializer
        serializer = ProfessionalSerializer(data=valid_professional_data)
        assert serializer.is_valid()

        # Create a mock professional object with photo_url
        class MockProfessional:
            photo_url = 'https://example.com/photo.jpg'

        mock_prof = MockProfessional()
        assert serializer.get_photo_url(mock_prof) == 'https://example.com/photo.jpg'

        # Test with ProfessionalSummarySerializer
        summary_serializer = ProfessionalSummarySerializer()
        assert summary_serializer.get_photo_url(mock_prof) == 'https://example.com/photo.jpg'

    def test_serializer_validation_methods_comprehensive(self, valid_professional_data):
        """Test all serializer validation methods comprehensively"""
        from professionals.serializers import ProfessionalSerializer

        # Test validate_name method
        serializer = ProfessionalSerializer()
        assert serializer.validate_name('João Silva') == 'João Silva'

        with pytest.raises(serializers.ValidationError):
            serializer.validate_name('')  # Empty name

        # Test validate_bio method
        long_bio = 'A' * 50  # Minimum 50 characters
        assert serializer.validate_bio(long_bio) == long_bio

        with pytest.raises(serializers.ValidationError):
            serializer.validate_bio('A' * 49)  # Too short

        # Test validate_services method
        assert serializer.validate_services(['Reiki']) == ['Reiki']

        with pytest.raises(serializers.ValidationError):
            serializer.validate_services([])  # Empty services

        # Test validate_price_per_session method
        assert serializer.validate_price_per_session(100.00) == 100.00

        with pytest.raises(serializers.ValidationError):
            serializer.validate_price_per_session(0)  # Zero price

        # Test validate_whatsapp method
        assert serializer.validate_whatsapp('11999999999') == '11999999999'
        assert serializer.validate_whatsapp('') is ''  # Empty allowed

        with pytest.raises(serializers.ValidationError):
            serializer.validate_whatsapp('119999999999')  # Invalid phone

        # Test validate_phone method
        assert serializer.validate_phone('1133334444') == '1133334444'
        assert serializer.validate_phone(None) is None  # None allowed

        with pytest.raises(serializers.ValidationError):
            serializer.validate_phone('02999999999')  # Invalid area code

        # Test validate_state method
        assert serializer.validate_state('SP') == 'SP'
        assert serializer.validate_state('sp') == 'SP'  # Case conversion

        with pytest.raises(serializers.ValidationError):
            serializer.validate_state('XX')  # Invalid state

    @pytest.mark.django_db
    def test_cross_field_validation_different_phones(self, valid_professional_data):
        """Test cross-field validation with different phone numbers"""
        data = valid_professional_data.copy()
        data['whatsapp'] = '(11) 99999-9999'
        data['phone'] = '(11) 98888-8888'  # Different phone in valid format (11 digits, starts with 9)

        serializer = ProfessionalSerializer(data=data)
        assert serializer.is_valid(), f"Serializer errors: {serializer.errors}"

    @pytest.mark.django_db
    def test_cross_field_validation_city_state_consistency(self, valid_professional_data):
        """Test city and state consistency validation"""
        data = valid_professional_data.copy()
        data['city'] = 'São Paulo'
        data['state'] = 'SP'

        serializer = ProfessionalSerializer(data=data)
        assert serializer.is_valid(), f"Serializer errors: {serializer.errors}"  # Should pass with both city and state

        # Test with only city - state is required, so this should fail
        data_only_city = data.copy()
        del data_only_city['state']
        serializer2 = ProfessionalSerializer(data=data_only_city)
        assert not serializer2.is_valid()  # Should fail without state
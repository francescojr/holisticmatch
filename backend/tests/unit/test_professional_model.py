"""
Unit tests for Professional model validations.
Tests model-level validation using the custom validators.
"""
import pytest
from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from django.contrib.auth.models import User
from professionals.models import Professional
from professionals.constants import SERVICE_TYPES


@pytest.fixture
def valid_user():
    """Create a valid user for testing"""
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123'
    )


@pytest.fixture
def valid_professional_data(valid_user):
    """Valid professional data for testing"""
    return {
        'user': valid_user,
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


class TestProfessionalModelValidation:
    """Test Professional model validations"""

    @pytest.mark.django_db
    def test_valid_professional_creation(self, valid_professional_data):
        """Test creating a valid professional"""
        professional = Professional(**valid_professional_data)
        professional.full_clean()  # Should not raise ValidationError
        professional.save()
        assert professional.pk is not None

    @pytest.mark.django_db
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
            professional = Professional(**data)
            with pytest.raises(ValidationError):
                professional.full_clean()

    @pytest.mark.django_db
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
            professional = Professional(**data)
            with pytest.raises(ValidationError):
                professional.full_clean()

    @pytest.mark.django_db
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
            professional = Professional(**data)
            with pytest.raises(ValidationError):
                professional.full_clean()

    @pytest.mark.django_db
    def test_invalid_state_validation(self, valid_professional_data):
        """Test state code validation errors"""
        invalid_states = ['', 'XX', 'SPP', '123']

        for invalid_state in invalid_states:
            data = valid_professional_data.copy()
            data['state'] = invalid_state
            professional = Professional(**data)
            with pytest.raises(ValidationError):
                professional.full_clean()

    @pytest.mark.django_db
    def test_invalid_price_validation(self, valid_professional_data):
        """Test price validation errors"""
        invalid_prices = [0, -10, 5001]

        for invalid_price in invalid_prices:
            data = valid_professional_data.copy()
            data['price_per_session'] = invalid_price
            professional = Professional(**data)
            with pytest.raises(ValidationError):
                professional.full_clean()

    @pytest.mark.django_db
    def test_invalid_phone_validation(self, valid_professional_data):
        """Test phone number validation errors"""
        invalid_phones = ['119999999999', '02999999999', '999999999', 'invalid']

        for invalid_phone in invalid_phones:
            data = valid_professional_data.copy()
            data['phone'] = invalid_phone
            professional = Professional(**data)
            with pytest.raises(ValidationError):
                professional.full_clean()

            data2 = valid_professional_data.copy()
            data2['whatsapp'] = invalid_phone
            professional2 = Professional(**data2)
            with pytest.raises(ValidationError):
                professional2.full_clean()

    @pytest.mark.django_db
    def test_photo_validation(self, valid_professional_data):
        """Test photo validation"""
        # Valid photo
        valid_photo = ContentFile(b'fake image data', name='test.jpg')
        valid_photo.content_type = 'image/jpeg'
        valid_photo.size = 1024 * 1024  # 1MB

        data = valid_professional_data.copy()
        data['photo'] = valid_photo
        professional = Professional(**data)
        professional.full_clean()  # Should not raise

        # Invalid photo (too large)
        large_photo = ContentFile(b'x' * (6 * 1024 * 1024), name='large.jpg')
        large_photo.content_type = 'image/jpeg'

        data2 = valid_professional_data.copy()
        data2['photo'] = large_photo
        professional2 = Professional(**data2)
        with pytest.raises(ValidationError):
            professional2.full_clean()

    @pytest.mark.django_db
    def test_optional_fields(self, valid_professional_data):
        """Test that optional fields work correctly"""
        # Test with empty phone/whatsapp
        data = valid_professional_data.copy()
        data['phone'] = ''
        data['whatsapp'] = ''
        professional = Professional(**data)
        professional.full_clean()  # Should not raise

        # Test with null photo
        data['photo'] = None
        professional = Professional(**data)
        professional.full_clean()  # Should not raise

    @pytest.mark.django_db
    def test_duplicate_services_validation(self, valid_professional_data):
        """Test duplicate services are rejected"""
        data = valid_professional_data.copy()
        data['services'] = ['Reiki', 'Reiki']  # Duplicates
        professional = Professional(**data)
        with pytest.raises(ValidationError):
            professional.full_clean()

    @pytest.mark.django_db
    def test_case_insensitive_state_validation(self, valid_professional_data):
        """Test state codes are accepted in uppercase"""
        data = valid_professional_data.copy()
        data['state'] = 'SP'  # uppercase
        professional = Professional(**data)
        professional.full_clean()  # Should not raise
        assert professional.state == 'SP'

    @pytest.mark.django_db
    def test_professional_str_method(self, valid_professional_data):
        """Test __str__ method returns professional name"""
        professional = Professional(**valid_professional_data)
        assert str(professional) == valid_professional_data['name']

    @pytest.mark.django_db
    def test_photo_url_property_with_photo(self, valid_professional_data):
        """Test photo_url property when photo exists"""
        # Create a mock photo file
        from django.core.files.base import ContentFile
        photo_file = ContentFile(b'fake image data', name='test.jpg')
        photo_file.content_type = 'image/jpeg'

        data = valid_professional_data.copy()
        data['photo'] = photo_file
        professional = Professional(**data)
        professional.save()

        # The photo_url should return the photo URL
        assert professional.photo_url is not None
        assert 'https://holisticmatch-media.s3.amazonaws.com' in professional.photo_url
        assert 'photos' in professional.photo_url
        assert professional.photo_url.endswith('.jpg')

    @pytest.mark.django_db
    def test_photo_url_property_without_photo(self, valid_professional_data):
        """Test photo_url property when no photo exists"""
        data = valid_professional_data.copy()
        data['photo'] = None
        professional = Professional(**data)
        professional.save()

        assert professional.photo_url is None

    @pytest.mark.django_db
    def test_model_ordering(self, valid_user):
        """Test that professionals are ordered by created_at descending"""
        # Create professionals with different creation times
        prof1 = Professional.objects.create(
            user=valid_user,
            name='Professional 1',
            bio='Bio 1',
            services=['Reiki'],
            city='City 1',
            state='SP',
            price_per_session=100.00,
            attendance_type='presencial',
            whatsapp='11999999999',
            email='prof1@example.com',
        )

        # Create another user for second professional
        user2 = User.objects.create_user(
            username='user2',
            email='user2@example.com',
            password='testpass123'
        )

        prof2 = Professional.objects.create(
            user=user2,
            name='Professional 2',
            bio='Bio 2',
            services=['Acupuntura'],
            city='City 2',
            state='RJ',
            price_per_session=200.00,
            attendance_type='online',
            whatsapp='21999999999',
            email='prof2@example.com',
        )

        # Query all professionals - should be ordered by created_at desc
        professionals = list(Professional.objects.all())
        assert len(professionals) == 2

        # prof2 should come first (created more recently)
        assert professionals[0].name == 'Professional 2'
        assert professionals[1].name == 'Professional 1'

    @pytest.mark.django_db
    def test_model_indexes_exist(self, valid_professional_data):
        """Test that model indexes are properly defined"""
        # Test that the model has the expected indexes defined in Meta
        meta_indexes = Professional._meta.indexes
        index_fields = []

        for index in meta_indexes:
            if hasattr(index, 'fields'):
                index_fields.extend(index.fields)

        # Check that key fields are indexed
        assert 'city' in index_fields
        assert 'state' in index_fields
        assert 'price_per_session' in index_fields
        assert 'attendance_type' in index_fields
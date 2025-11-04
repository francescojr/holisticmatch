"""
Contract tests for Professional API endpoints
Tests API behavior from client perspective
"""
import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from professionals.models import Professional


@pytest.fixture
def api_client():
    """API client fixture"""
    return APIClient()


@pytest.fixture
def test_user():
    """Create a test user"""
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123'
    )


@pytest.fixture
def test_professional(test_user):
    """Create a test professional"""
    return Professional.objects.create(
        user=test_user,
        name='João Silva',
        bio='Profissional experiente em terapias holísticas.',
        services=['Reiki', 'Acupuntura'],
        city='São Paulo',
        state='SP',
        price_per_session=150.00,
        attendance_type='ambos',
        whatsapp='11999999999',
        email='joao@example.com',
        phone='1133334444',
    )


@pytest.fixture
def auth_client(api_client, test_user):
    """Authenticated API client"""
    refresh = RefreshToken.for_user(test_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client


@pytest.fixture
def other_user():
    """Create another test user"""
    return User.objects.create_user(
        username='otheruser',
        email='other@example.com',
        password='testpass123'
    )


@pytest.fixture
def other_professional(other_user):
    """Create another test professional"""
    return Professional.objects.create(
        user=other_user,
        name='Maria Santos',
        bio='Especialista em massagem terapêutica.',
        services=['Massagem'],
        city='Rio de Janeiro',
        state='RJ',
        price_per_session=120.00,
        attendance_type='presencial',
        whatsapp='21988888888',
        email='maria@example.com',
        phone='2122223333',
    )


@pytest.mark.django_db
class TestProfessionalListAPI:
    """Test GET /api/v1/professionals/ endpoint"""

    def test_list_returns_200(self, api_client):
        """Should return 200 OK for GET request"""
        response = api_client.get('/api/v1/professionals/')
        assert response.status_code == 200

    def test_list_returns_paginated_response(self, api_client):
        """Should return pagination metadata"""
        response = api_client.get('/api/v1/professionals/')
        data = response.json()
        
        assert 'count' in data
        assert 'next' in data
        assert 'previous' in data
        assert 'results' in data
        assert isinstance(data['results'], list)
    
    def test_list_returns_professional_fields(self, api_client, test_professional):
        """Should return required fields for each professional"""
        response = api_client.get('/api/v1/professionals/')
        data = response.json()

        assert len(data['results']) > 0
        professional = data['results'][0]
        required_fields = [
            'id', 'name', 'services', 'city', 'state',
            'price_per_session', 'attendance_type', 'photo_url'
        ]
        for field in required_fields:
            assert field in professional, f"Missing field: {field}"

    def test_list_filters_by_service(self, api_client, test_professional):
        """Should filter professionals by service type"""
        response = api_client.get('/api/v1/professionals/?service=Reiki')
        assert response.status_code == 200
        data = response.json()
        # Should find the test professional
        assert len(data['results']) >= 1

    def test_list_filters_by_city(self, api_client, test_professional):
        """Should filter professionals by city"""
        response = api_client.get('/api/v1/professionals/?city=São Paulo')
        assert response.status_code == 200
        data = response.json()
        assert len(data['results']) >= 1

    def test_list_filters_by_price_range(self, api_client, test_professional):
        """Should filter professionals by price range"""
        response = api_client.get('/api/v1/professionals/?price_min=100&price_max=200')
        assert response.status_code == 200
        data = response.json()
        assert len(data['results']) >= 1

    def test_list_filters_by_attendance_type(self, api_client, test_professional):
        """Should filter professionals by attendance type"""
        response = api_client.get('/api/v1/professionals/?attendance_type=ambos')
        assert response.status_code == 200
        data = response.json()
        assert len(data['results']) >= 1

    def test_list_pagination_limit(self, api_client):
        """Should return maximum 12 items per page"""
        response = api_client.get('/api/v1/professionals/')
        data = response.json()
        assert len(data['results']) <= 12


@pytest.mark.django_db
class TestProfessionalDetailAPI:
    """Test GET /api/v1/professionals/{id}/ endpoint"""

    def test_detail_returns_404_for_invalid_id(self, api_client):
        """Should return 404 for non-existent professional"""
        response = api_client.get('/api/v1/professionals/99999/')
        assert response.status_code == 404

    def test_detail_returns_professional(self, api_client, test_professional):
        """Should return professional details"""
        response = api_client.get(f'/api/v1/professionals/{test_professional.id}/')
        assert response.status_code == 200
        data = response.json()

        # Check required fields
        required_fields = [
            'id', 'user', 'name', 'bio', 'services', 'city', 'state',
            'price_per_session', 'attendance_type', 'whatsapp', 'email',
            'phone', 'photo_url', 'created_at', 'updated_at'
        ]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"

        assert data['name'] == 'João Silva'
        assert data['city'] == 'São Paulo'


@pytest.mark.django_db
class TestProfessionalCreateAPI:
    """Test POST /api/v1/professionals/ endpoint"""

    def test_create_requires_authentication(self, api_client):
        """Should require authentication to create professional"""
        data = {
            'name': 'João Silva',
            'bio': 'Profissional experiente em terapias holísticas com mais de 10 anos de experiência. Especializado em Reiki e meditação.',
            'services': ['Reiki'],
            'city': 'São Paulo',
            'state': 'SP',
            'price_per_session': 150.00,
            'attendance_type': 'ambos',
            'whatsapp': '11999999999',
            'email': 'joao@example.com',
            'phone': '1133334444',
        }
        response = api_client.post('/api/v1/professionals/', data, format='json')
        assert response.status_code == 401

    def test_create_professional_success(self, auth_client, test_user):
        """Should create professional successfully"""
        data = {
            'name': 'João Silva',
            'bio': 'Profissional experiente em terapias holísticas com mais de 10 anos de experiência. Especializado em Reiki e meditação guiada para promover bem-estar e equilíbrio espiritual.',
            'services': ['Reiki', 'Acupuntura'],
            'city': 'São Paulo',
            'state': 'SP',
            'price_per_session': 150.00,
            'attendance_type': 'ambos',
            'whatsapp': '11999999999',
            'email': 'joao@example.com',
            'phone': '1133334444',
        }
        response = auth_client.post('/api/v1/professionals/', data, format='json')
        assert response.status_code == 201

        # Check response data
        response_data = response.json()
        assert response_data['name'] == 'João Silva'
        assert response_data['city'] == 'São Paulo'
        assert response_data['user']['id'] == test_user.id

        # Check database
        professional = Professional.objects.get(user=test_user)
        assert professional.name == 'João Silva'
        assert professional.user == test_user

    def test_create_professional_validation_error(self, auth_client):
        """Should return validation errors for invalid data"""
        data = {
            'name': 'AB',  # Too short
            'bio': 'Short',  # Too short
            'services': [],  # Empty
            'city': 'São Paulo',
            'state': 'XX',  # Invalid state
            'price_per_session': 0,  # Invalid price
            'attendance_type': 'ambos',
            'whatsapp': '119999999999',  # Invalid phone
            'email': 'joao@example.com',
            'phone': '1133334444',
        }
        response = auth_client.post('/api/v1/professionals/', data, format='json')
        assert response.status_code == 400

        errors = response.json()
        assert 'name' in errors
        assert 'bio' in errors
        assert 'services' in errors
        assert 'state' in errors
        assert 'price_per_session' in errors
        assert 'whatsapp' in errors


@pytest.mark.django_db
class TestProfessionalUpdateAPI:
    """Test PUT/PATCH /api/v1/professionals/{id}/ endpoints"""

    def test_update_requires_ownership(self, api_client, other_professional, test_user):
        """Should require ownership to update professional"""
        refresh = RefreshToken.for_user(test_user)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        data = {'name': 'Updated Name'}
        response = api_client.patch(f'/api/v1/professionals/{other_professional.id}/', data, format='json')
        assert response.status_code == 403

    def test_partial_update_success(self, auth_client, test_professional):
        """Should update professional successfully with PATCH"""
        data = {
            'name': 'João Silva Updated',
            'price_per_session': 200.00
        }
        response = auth_client.patch(f'/api/v1/professionals/{test_professional.id}/', data, format='json')
        assert response.status_code == 200

        # Check response
        response_data = response.json()
        assert response_data['name'] == 'João Silva Updated'
        assert float(response_data['price_per_session']) == 200.00

        # Check database
        test_professional.refresh_from_db()
        assert test_professional.name == 'João Silva Updated'
        assert test_professional.price_per_session == 200.00

    def test_full_update_success(self, auth_client, test_professional):
        """Should update professional successfully with PUT"""
        data = {
            'name': 'João Silva Full Update',
            'bio': 'Bio completamente atualizada com informações detalhadas sobre os serviços oferecidos e experiência profissional acumulada ao longo dos anos.',
            'services': ['Reiki'],
            'city': 'Rio de Janeiro',
            'state': 'RJ',
            'price_per_session': 180.00,
            'attendance_type': 'online',
            'whatsapp': '21999999999',
            'email': 'joao_updated@example.com',
            'phone': '2122224444',
        }
        response = auth_client.put(f'/api/v1/professionals/{test_professional.id}/', data, format='json')
        assert response.status_code == 200

        # Check response
        response_data = response.json()
        assert response_data['name'] == 'João Silva Full Update'
        assert response_data['city'] == 'Rio de Janeiro'
        assert response_data['state'] == 'RJ'

        # Check database
        test_professional.refresh_from_db()
        assert test_professional.name == 'João Silva Full Update'
        assert test_professional.city == 'Rio de Janeiro'

    def test_update_validation_error(self, auth_client, test_professional):
        """Should return validation errors for invalid update data"""
        data = {
            'name': 'A',  # Too short
            'price_per_session': -10,  # Invalid price
        }
        response = auth_client.patch(f'/api/v1/professionals/{test_professional.id}/', data, format='json')
        assert response.status_code == 400

        errors = response.json()
        assert 'name' in errors
        assert 'price_per_session' in errors


@pytest.mark.django_db
class TestProfessionalDeleteAPI:
    """Test DELETE /api/v1/professionals/{id}/ endpoint"""

    def test_delete_requires_ownership(self, api_client, other_professional, test_user):
        """Should require ownership to delete professional"""
        refresh = RefreshToken.for_user(test_user)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        response = api_client.delete(f'/api/v1/professionals/{other_professional.id}/')
        assert response.status_code == 403

    def test_delete_success(self, auth_client, test_professional):
        """Should delete professional successfully"""
        professional_id = test_professional.id
        response = auth_client.delete(f'/api/v1/professionals/{professional_id}/')
        assert response.status_code == 204

        # Check database
        assert not Professional.objects.filter(id=professional_id).exists()


@pytest.mark.django_db
class TestProfessionalServiceTypesAPI:
    """Test GET /api/v1/professionals/service_types/ endpoint"""

    def test_service_types_returns_200(self, api_client):
        """Should return 200 OK for service types request"""
        response = api_client.get('/api/v1/professionals/service_types/')
        assert response.status_code == 200

    def test_service_types_returns_list(self, api_client):
        """Should return list of service types"""
        response = api_client.get('/api/v1/professionals/service_types/')
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert 'Reiki' in data  # Should contain known service types


@pytest.mark.django_db
class TestProfessionalPhotoUploadAPI:
    """Test POST /api/v1/professionals/{id}/upload-photo/ endpoint"""

    def test_upload_photo_success(self, auth_client, test_professional):
        """Should successfully upload photo and return URL"""
        from io import BytesIO
        from PIL import Image
        from django.core.files.base import ContentFile

        # Create a test image
        image = Image.new('RGB', (100, 100), color='red')
        image_bytes = BytesIO()
        image.save(image_bytes, format='JPEG')
        image_bytes.seek(0)

        # Create ContentFile with proper content type
        photo_file = ContentFile(image_bytes.getvalue(), name='test_photo.jpg')

        # Upload photo
        response = auth_client.post(
            f'/api/v1/professionals/{test_professional.id}/upload-photo/',
            {'photo': photo_file},
            format='multipart'
        )

        assert response.status_code == 200
        data = response.json()
        assert 'message' in data
        assert 'photo_url' in data
        assert data['message'] == 'Foto atualizada com sucesso'
        assert data['photo_url'] is not None

        # Verify photo was saved
        test_professional.refresh_from_db()
        assert test_professional.photo is not None

    def test_upload_photo_unauthenticated(self, api_client, test_professional):
        """Should return 401 for unauthenticated user"""
        from io import BytesIO
        from PIL import Image

        image = Image.new('RGB', (100, 100), color='red')
        image_bytes = BytesIO()
        image.save(image_bytes, format='JPEG')
        image_bytes.seek(0)

        response = api_client.post(
            f'/api/v1/professionals/{test_professional.id}/upload-photo/',
            {'photo': image_bytes},
            format='multipart'
        )

        assert response.status_code == 401

    def test_upload_photo_wrong_owner(self, api_client, test_professional):
        """Should return 403 when trying to upload to another user's profile"""
        # Create another user and authenticate
        other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='testpass123'
        )
        refresh = RefreshToken.for_user(other_user)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        from io import BytesIO
        from PIL import Image

        image = Image.new('RGB', (100, 100), color='red')
        image_bytes = BytesIO()
        image.save(image_bytes, format='JPEG')
        image_bytes.seek(0)

        response = api_client.post(
            f'/api/v1/professionals/{test_professional.id}/upload-photo/',
            {'photo': image_bytes},
            format='multipart'
        )

        assert response.status_code == 403
        data = response.json()
        assert 'error' in data
        assert 'só pode alterar sua própria foto' in data['error']

    def test_upload_photo_invalid_file_type(self, auth_client, test_professional):
        """Should return 400 for invalid file type"""
        from django.core.files.base import ContentFile

        # Create a text file instead of image
        text_file = ContentFile(b'This is not an image', name='test.txt')

        response = auth_client.post(
            f'/api/v1/professionals/{test_professional.id}/upload-photo/',
            {'photo': text_file},
            format='multipart'
        )

        assert response.status_code == 400
        data = response.json()
        assert 'error' in data
        assert 'JPG ou PNG' in data['error']

    def test_upload_photo_file_too_large(self, auth_client, test_professional):
        """Should return 400 for file larger than 5MB"""
        from django.core.files.base import ContentFile

        # Create a large file (6MB)
        large_content = b'0' * (6 * 1024 * 1024)
        large_file = ContentFile(large_content, name='large.jpg')

        response = auth_client.post(
            f'/api/v1/professionals/{test_professional.id}/upload-photo/',
            {'photo': large_file},
            format='multipart'
        )

        assert response.status_code == 400
        data = response.json()
        assert 'error' in data
        assert '5MB' in data['error']

    def test_upload_photo_no_file_provided(self, auth_client, test_professional):
        """Should return 400 when no photo file is provided"""
        response = auth_client.post(
            f'/api/v1/professionals/{test_professional.id}/upload-photo/',
            {},
            format='multipart'
        )

        assert response.status_code == 400
        data = response.json()
        assert 'error' in data
        assert 'Arquivo de foto é obrigatório' in data['error']

    def test_upload_photo_professional_not_found(self, auth_client):
        """Should return 404 for non-existent professional"""
        from io import BytesIO
        from PIL import Image
        from django.core.files.base import ContentFile

        image = Image.new('RGB', (100, 100), color='red')
        image_bytes = BytesIO()
        image.save(image_bytes, format='JPEG')
        image_bytes.seek(0)

        photo_file = ContentFile(image_bytes.getvalue(), name='test_photo.jpg')

        response = auth_client.post(
            '/api/v1/professionals/99999/upload-photo/',
            {'photo': photo_file},
            format='multipart'
        )

        assert response.status_code == 404
        data = response.json()
        assert 'error' in data
        assert 'Profissional não encontrado' in data['error']

    def test_upload_photo_replaces_existing(self, auth_client, test_professional):
        """Should replace existing photo when uploading new one"""
        from io import BytesIO
        from PIL import Image
        from django.core.files.base import ContentFile

        # Upload first photo
        image1 = Image.new('RGB', (100, 100), color='red')
        image_bytes1 = BytesIO()
        image1.save(image_bytes1, format='JPEG')
        image_bytes1.seek(0)

        photo_file1 = ContentFile(image_bytes1.getvalue(), name='test_photo1.jpg')

        response1 = auth_client.post(
            f'/api/v1/professionals/{test_professional.id}/upload-photo/',
            {'photo': photo_file1},
            format='multipart'
        )
        assert response1.status_code == 200

        first_photo_url = response1.json()['photo_url']

        # Upload second photo
        image2 = Image.new('RGB', (100, 100), color='blue')
        image_bytes2 = BytesIO()
        image2.save(image_bytes2, format='JPEG')
        image_bytes2.seek(0)

        photo_file2 = ContentFile(image_bytes2.getvalue(), name='test_photo2.jpg')

        response2 = auth_client.post(
            f'/api/v1/professionals/{test_professional.id}/upload-photo/',
            {'photo': photo_file2},
            format='multipart'
        )
        assert response2.status_code == 200

        second_photo_url = response2.json()['photo_url']

        # URLs should be different (new photo uploaded)
        assert first_photo_url != second_photo_url

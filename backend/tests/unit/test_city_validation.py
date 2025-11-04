"""
Unit tests for city and state validation.
Tests that professional registrations validate city-state pairs correctly.
"""
import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from professionals.models import Professional, City


@pytest.fixture
def api_client():
    """API client fixture"""
    return APIClient()


@pytest.fixture
def city_data():
    """Create test city data"""
    City.objects.create(state='SP', name='São Paulo')
    City.objects.create(state='SP', name='Campinas')
    City.objects.create(state='RJ', name='Rio de Janeiro')
    City.objects.create(state='MG', name='Belo Horizonte')
    
    return {
        'SP': ['São Paulo', 'Campinas'],
        'RJ': ['Rio de Janeiro'],
        'MG': ['Belo Horizonte'],
    }


class TestCityStateValidation:
    """Test city-state validation in professional registration"""

    @pytest.mark.django_db
    def test_register_with_valid_city_state(self, api_client, city_data):
        """Test professional registration with valid city-state pair"""
        response = api_client.post(
            '/api/v1/professionals/register/',
            {
                'email': 'prof@example.com',
                'password': 'SecurePass123',
                'name': 'João Silva',
                'phone': '(11) 99999-9999',
                'bio': 'Especialista em Reiki com mais de 10 anos de experiência em terapias holísticas.',
                'services': ['Reiki'],
                'price_per_session': 150.00,
                'city': 'São Paulo',  # Valid city in SP
                'state': 'SP',  # Valid state
                'attendance_type': 'presencial',
                'whatsapp': '(11) 98888-8888',
            },
            format='json'
        )
        
        assert response.status_code == 201
        professional = Professional.objects.get(user__email='prof@example.com')
        assert professional.city == 'São Paulo'
        assert professional.state == 'SP'

    @pytest.mark.django_db
    def test_register_with_invalid_city_for_state(self, api_client, city_data):
        """Test professional registration with city not in given state fails"""
        response = api_client.post(
            '/api/v1/professionals/register/',
            {
                'email': 'prof@example.com',
                'password': 'SecurePass123',
                'name': 'João Silva',
                'phone': '(11) 99999-9999',
                'bio': 'Especialista em Reiki com mais de 10 anos de experiência em terapias holísticas.',
                'services': ['Reiki'],
                'price_per_session': 150.00,
                'city': 'Rio de Janeiro',  # RJ city
                'state': 'SP',  # But SP state - mismatch!
                'attendance_type': 'presencial',
                'whatsapp': '(11) 98888-8888',
            },
            format='json'
        )
        
        assert response.status_code == 400
        assert 'city' in response.data or 'state' in response.data
        assert Professional.objects.filter(user__email='prof@example.com').count() == 0

    @pytest.mark.django_db
    def test_register_with_nonexistent_city(self, api_client, city_data):
        """Test professional registration with non-existent city fails"""
        response = api_client.post(
            '/api/v1/professionals/register/',
            {
                'email': 'prof@example.com',
                'password': 'SecurePass123',
                'name': 'João Silva',
                'phone': '(11) 99999-9999',
                'bio': 'Especialista em Reiki com mais de 10 anos de experiência em terapias holísticas.',
                'services': ['Reiki'],
                'price_per_session': 150.00,
                'city': 'Fictitious City',  # Doesn't exist
                'state': 'SP',
                'attendance_type': 'presencial',
                'whatsapp': '(11) 98888-8888',
            },
            format='json'
        )
        
        assert response.status_code == 400
        assert 'city' in response.data or 'state' in response.data
        assert Professional.objects.filter(user__email='prof@example.com').count() == 0

    @pytest.mark.django_db
    def test_register_with_different_state_cities(self, api_client, city_data):
        """Test professional registration with valid cities from different states"""
        # RJ city with RJ state
        response = api_client.post(
            '/api/v1/professionals/register/',
            {
                'email': 'prof1@example.com',
                'password': 'SecurePass123',
                'name': 'Maria Silva',
                'phone': '(21) 99999-9999',
                'bio': 'Especialista em Reiki com mais de 10 anos de experiência em terapias holísticas.',
                'services': ['Meditação'],
                'price_per_session': 120.00,
                'city': 'Rio de Janeiro',
                'state': 'RJ',
                'attendance_type': 'online',
                'whatsapp': '(21) 98888-8888',
            },
            format='json'
        )
        
        assert response.status_code == 201
        prof_rj = Professional.objects.get(user__email='prof1@example.com')
        assert prof_rj.city == 'Rio de Janeiro'
        assert prof_rj.state == 'RJ'

        # MG city with MG state
        response = api_client.post(
            '/api/v1/professionals/register/',
            {
                'email': 'prof2@example.com',
                'password': 'SecurePass123',
                'name': 'Pedro Costa',
                'phone': '(31) 99999-9999',
                'bio': 'Especialista em Reiki com mais de 10 anos de experiência em terapias holísticas.',
                'services': ['Yoga'],
                'price_per_session': 100.00,
                'city': 'Belo Horizonte',
                'state': 'MG',
                'attendance_type': 'ambos',
                'whatsapp': '(31) 98888-8888',
            },
            format='json'
        )
        
        assert response.status_code == 201
        prof_mg = Professional.objects.get(user__email='prof2@example.com')
        assert prof_mg.city == 'Belo Horizonte'
        assert prof_mg.state == 'MG'

    @pytest.mark.django_db
    def test_update_professional_with_valid_city_state(self, api_client, city_data):
        """Test updating professional with valid city-state pair"""
        # Create user and professional
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        professional = Professional.objects.create(
            user=user,
            name='João Silva',
            bio='Especialista em Reiki com mais de 10 anos de experiência em terapias holísticas.',
            services=['Reiki'],
            city='São Paulo',
            state='SP',
            price_per_session=150.00,
            email='test@example.com'
        )
        
        # Authenticate
        api_client.force_authenticate(user=user)
        
        # Update to valid city-state in another state
        response = api_client.patch(
            f'/api/v1/professionals/{professional.id}/',
            {
                'city': 'Rio de Janeiro',
                'state': 'RJ',
            },
            format='json'
        )
        
        assert response.status_code == 200
        professional.refresh_from_db()
        assert professional.city == 'Rio de Janeiro'
        assert professional.state == 'RJ'

    @pytest.mark.django_db
    def test_update_professional_with_invalid_city_state(self, api_client, city_data):
        """Test updating professional with invalid city-state pair fails"""
        # Create user and professional
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        professional = Professional.objects.create(
            user=user,
            name='João Silva',
            bio='Especialista em Reiki com mais de 10 anos de experiência em terapias holísticas.',
            services=['Reiki'],
            city='São Paulo',
            state='SP',
            price_per_session=150.00,
            email='test@example.com'
        )
        
        # Authenticate
        api_client.force_authenticate(user=user)
        
        # Try to update to invalid city-state mismatch
        response = api_client.patch(
            f'/api/v1/professionals/{professional.id}/',
            {
                'city': 'Rio de Janeiro',
                'state': 'SP',  # Mismatch!
            },
            format='json'
        )
        
        assert response.status_code == 400
        professional.refresh_from_db()
        # Original values should be unchanged
        assert professional.city == 'São Paulo'
        assert professional.state == 'SP'

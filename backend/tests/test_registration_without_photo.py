"""
Test registration without photo to verify fixes work
"""
import pytest
import json
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from professionals.models import Professional


@pytest.mark.django_db
class TestRegistrationWithoutPhoto:
    """Test registration flow without photo"""
    
    def test_registration_without_photo_success(self):
        """Test successful registration without photo"""
        client = APIClient()
        
        # Clean up any existing test user
        User.objects.filter(email='test_reg_nophoto@example.com').delete()
        
        # Prepare registration data WITHOUT photo
        registration_data = {
            'full_name': 'João Silva Test',
            'email': 'test_reg_nophoto@example.com',
            'password': 'TestPass123!',
            'bio': 'Terapeuta holístico com experiência comprovada',  # 20+ chars
            'services': json.dumps(['Reiki', 'Meditação Guiada']),  # JSON string with correct service names
            'price_per_session': 150,
            'attendance_type': 'online',
            'state': 'SP',
            'city': 'São Paulo',
            'neighborhood': 'Centro',
            'whatsapp': '11987654321',
            'phone': '1133334444',
        }
        
        # Make POST request
        response = client.post('/api/v1/professionals/register/', data=registration_data)
        
        # Assertions
        assert response.status_code == 201, f"Expected 201, got {response.status_code}. Errors: {response.json()}"
        
        data = response.json()
        assert 'email' in data
        assert 'professional_id' in data
        assert 'message' in data
        assert data['email'] == 'test_reg_nophoto@example.com'
        # NOTE: JWT tokens are NOT returned from register endpoint anymore
        # User must verify email first, then login to get tokens
        
        # Verify user and professional created
        user = User.objects.get(email='test_reg_nophoto@example.com')
        professional = Professional.objects.get(user=user)
        
        assert professional.name == 'João Silva Test'
        assert professional.bio == 'Terapeuta holístico com experiência comprovada'
        assert professional.photo is None or professional.photo == ''  # No photo
        assert professional.services == ['Reiki', 'Meditação Guiada']
        
        print('✅ Test passed: Registration without photo successful')
    
    def test_registration_bio_too_short_fails(self):
        """Test that bio less than 20 characters fails"""
        client = APIClient()
        
        User.objects.filter(email='test_bio_short@example.com').delete()
        
        registration_data = {
            'full_name': 'Test User',
            'email': 'test_bio_short@example.com',
            'password': 'TestPass123!',
            'bio': 'Too short',  # Only 9 chars
            'services': json.dumps(['Yoga']),
            'price_per_session': 100,
            'attendance_type': 'online',
            'state': 'SP',
            'city': 'São Paulo',
        }
        
        response = client.post('/api/v1/professionals/register/', data=registration_data)
        
        # Should fail with 400
        assert response.status_code == 400
        errors = response.json()
        assert 'bio' in errors
        print('✅ Test passed: Bio validation rejects too short bio')
    
    def test_registration_full_name_mapping(self):
        """Test that full_name is properly mapped to name field"""
        client = APIClient()
        
        User.objects.filter(email='test_fullname@example.com').delete()
        
        registration_data = {
            'full_name': 'Maria Silva Santos',  # Using full_name
            'email': 'test_fullname@example.com',
            'password': 'TestPass123!',
            'bio': 'Profissional com experiência em terapias holísticas',
            'services': json.dumps(['Reiki']),
            'price_per_session': 120,
            'attendance_type': 'online',
            'state': 'RJ',
            'city': 'Rio de Janeiro',
        }
        
        response = client.post('/api/v1/professionals/register/', data=registration_data)
        
        assert response.status_code == 201, f"Expected 201, got {response.status_code}. Errors: {response.json()}"
        
        professional = Professional.objects.get(user__email='test_fullname@example.com')
        assert professional.name == 'Maria Silva Santos'
        print('✅ Test passed: full_name properly mapped to name')

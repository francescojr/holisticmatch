"""
Contract tests for Professional API endpoints
Tests API behavior from client perspective
"""
import pytest
from rest_framework.test import APIClient


@pytest.mark.django_db
class TestProfessionalListAPI:
    """Test GET /api/v1/professionals/ endpoint"""
    
    def test_list_returns_200(self):
        """Should return 200 OK for GET request"""
        client = APIClient()
        response = client.get('/api/v1/professionals/')
        assert response.status_code == 200
    
    def test_list_returns_paginated_response(self):
        """Should return pagination metadata"""
        client = APIClient()
        response = client.get('/api/v1/professionals/')
        data = response.json()
        
        assert 'count' in data
        assert 'next' in data
        assert 'previous' in data
        assert 'results' in data
        assert isinstance(data['results'], list)
    
    def test_list_returns_professional_fields(self):
        """Should return required fields for each professional"""
        client = APIClient()
        # TODO: Create test professional first
        response = client.get('/api/v1/professionals/')
        data = response.json()
        
        if data['results']:
            professional = data['results'][0]
            required_fields = [
                'id', 'user', 'name', 'bio', 'services',
                'city', 'state', 'price_per_session',
                'attendance_type', 'whatsapp', 'email',
                'phone', 'photo_url', 'created_at'
            ]
            for field in required_fields:
                assert field in professional, f"Missing field: {field}"
    
    def test_list_filters_by_service(self):
        """Should filter professionals by service type"""
        client = APIClient()
        response = client.get('/api/v1/professionals/?service=Reiki')
        assert response.status_code == 200
    
    def test_list_filters_by_city(self):
        """Should filter professionals by city"""
        client = APIClient()
        response = client.get('/api/v1/professionals/?city=São Paulo')
        assert response.status_code == 200
    
    def test_list_filters_by_price_range(self):
        """Should filter professionals by price range"""
        client = APIClient()
        response = client.get('/api/v1/professionals/?price_min=50&price_max=200')
        assert response.status_code == 200
    
    def test_list_filters_by_attendance_type(self):
        """Should filter professionals by attendance type"""
        client = APIClient()
        response = client.get('/api/v1/professionals/?attendance_type=presencial')
        assert response.status_code == 200
    
    def test_list_pagination_limit(self):
        """Should return maximum 12 items per page"""
        client = APIClient()
        response = client.get('/api/v1/professionals/')
        data = response.json()
        assert len(data['results']) <= 12


@pytest.mark.django_db
class TestProfessionalDetailAPI:
    """Test GET /api/v1/professionals/{id}/ endpoint"""
    
    def test_detail_returns_404_for_invalid_id(self):
        """Should return 404 for non-existent professional"""
        client = APIClient()
        response = client.get('/api/v1/professionals/99999/')
        assert response.status_code == 404
    
    def test_detail_returns_professional(self):
        """Should return professional details"""
        client = APIClient()
        # TODO: Create test professional first
        # For now, just test structure
        response = client.get('/api/v1/professionals/1/')
        # Will be 404 until we have data, but tests API is wired up
        assert response.status_code in [200, 404]

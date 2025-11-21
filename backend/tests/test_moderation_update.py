"""
Test to verify moderation works on UPDATE endpoint
"""
import pytest
from django.contrib.auth.models import User
from professionals.models import Professional


@pytest.mark.django_db
def test_update_with_offensive_name():
    """Should block offensive words in UPDATE"""
    # Create user and professional
    user = User.objects.create_user(
        username='testupdate@test.com',
        email='testupdate@test.com',
        password='TestPass123',
        is_active=True
    )
    
    prof = Professional.objects.create(
        user=user,
        name='Test Professional',
        bio='A professional with valid info',
        city='São Paulo',
        state='SP',
        phone='11999999999',
        price_per_session=100,
        attendance_type='presencial',
        whatsapp='11999999999'
    )
    
    from rest_framework.test import APIClient
    client = APIClient()
    client.force_authenticate(user=user)
    
    # Try to update with offensive name
    response = client.patch(f'/api/v1/professionals/{prof.id}/', {
        'name': 'Cararlho The Great'
    }, format='json')
    
    print(f"\nUPDATE with 'Cararlho':")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.data}")
    
    # Should be 400 Bad Request (validation error)
    assert response.status_code == 400, f"Expected 400, got {response.status_code}"
    assert 'name' in response.data, "Expected 'name' error in response"

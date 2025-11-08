#!/usr/bin/env python
"""
Manual test for registration endpoint without photo
Run this to verify the registration flow works locally
"""
import os
import django
import json
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
from django.contrib.auth.models import User
from professionals.models import Professional, City

# Create test client
client = Client()

# Clean up previous test data
User.objects.filter(email='test_registration@example.com').delete()

# Registration data WITHOUT photo
registration_data = {
    'full_name': 'João Silva Tester',  # Using full_name, not name
    'email': 'test_registration@example.com',
    'password': 'TestPass123!',
    'bio': 'Terapeuta holístico certificado com 5 anos de experiência',  # 20+ chars
    'services': '["Reiki", "Meditação"]',  # JSON string as it comes from FormData
    'price_per_session': 150,
    'attendance_type': 'online',
    'state': 'SP',
    'city': 'São Paulo',
    'neighborhood': 'Centro',
    'whatsapp': '11987654321',
}

print('=' * 80)
print('TESTING REGISTRATION WITHOUT PHOTO')
print('=' * 80)
print(f'\nRegistration data:')
for key, value in registration_data.items():
    print(f'  {key}: {value}')

# Make POST request to register endpoint
print('\nMaking POST request to /api/v1/professionals/register/')
response = client.post(
    '/api/v1/professionals/register/',
    data=registration_data,
    content_type='multipart/form-data',
)

print(f'\nResponse Status: {response.status_code}')
print(f'Response Headers: {dict(response)}')

if response.status_code in [200, 201]:
    data = response.json()
    print(f'\n✅ SUCCESS! Response:')
    print(json.dumps(data, indent=2, ensure_ascii=False))
    
    # Verify user was created
    user = User.objects.get(email='test_registration@example.com')
    professional = Professional.objects.get(user=user)
    print(f'\n✅ User created: {user.username} (id: {user.id})')
    print(f'✅ Professional created: {professional.name} (id: {professional.id})')
    print(f'   - Bio: {professional.bio}')
    print(f'   - Services: {professional.services}')
    print(f'   - Photo: {professional.photo if professional.photo else "None"}')
else:
    print(f'\n❌ FAILED! Error response:')
    print(json.dumps(response.json(), indent=2, ensure_ascii=False))

print('\n' + '=' * 80)

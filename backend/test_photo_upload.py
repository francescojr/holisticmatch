#!/usr/bin/env python3
"""
Test script to verify photo upload works correctly after the fix
Sends FormData with File object to backend
"""

import os
import sys
import requests
from io import BytesIO
from PIL import Image

# Configuration
BACKEND_URL = 'http://localhost:8000' if len(sys.argv) < 2 else sys.argv[1]
ENDPOINT = f'{BACKEND_URL}/api/v1/professionals/register/'

def create_test_image(filename='test.png', size=(100, 100)):
    """Create a simple test image"""
    img = Image.new('RGB', size, color='red')
    img_bytes = BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    img_bytes.name = filename
    return img_bytes

def test_upload():
    """Test photo upload"""
    print('='*80)
    print('📸 TESTING PHOTO UPLOAD FIX')
    print('='*80)
    
    # Create test image
    print('\n📝 Creating test image...')
    photo = create_test_image()
    print(f'✅ Created image: {photo.name}')
    
    # Prepare registration data
    registration_data = {
        'email': 'test_upload@example.com',
        'password': 'TestPass123!',
        'full_name': 'Test Upload User',
        'state': 'SP',
        'city': 'Sao Paulo',
        'neighborhood': 'Centro',
        'services': '["Meditaçao"]',  # JSON string
        'price_per_session': '100.00',
        'attendance_type': 'presencial',
        'bio': 'Test user for photo upload',
        'whatsapp': '11999999999',
    }
    
    # Add photo as file
    files = {
        'photo': ('test.png', photo, 'image/png'),
    }
    
    print('\n📦 Registration data:')
    for key, value in registration_data.items():
        if key != 'password':
            print(f'  {key}: {value}')
    
    print(f'\n📸 Photo file:')
    print(f'  Name: {files["photo"][0]}')
    print(f'  Type: {files["photo"][2]}')
    print(f'  Size: {len(photo.getvalue())} bytes')
    
    print(f'\n📡 Sending to: {ENDPOINT}')
    print('⚠️  CRITICAL: NOT setting Content-Type header (let requests auto-detect)')
    
    try:
        # Send request - requests library will automatically set correct multipart headers
        response = requests.post(
            ENDPOINT,
            data=registration_data,
            files=files,
            # DO NOT explicitly set Content-Type:
            # headers={'Content-Type': 'application/json'},  # ← This would BREAK it
            timeout=30
        )
        
        print(f'\n✅ Response received!')
        print(f'Status Code: {response.status_code}')
        
        try:
            response_json = response.json()
            print(f'\n📊 Response JSON:')
            import json
            print(json.dumps(response_json, indent=2, ensure_ascii=False))
            
            if response.status_code == 201:
                print('\n🎉 SUCCESS! Photo upload worked!')
                return True
            else:
                print('\n❌ FAILED! Backend returned error')
                if 'photo' in response_json:
                    print(f'Photo error: {response_json["photo"]}')
                return False
                
        except ValueError:
            print(f'\n📋 Response text:\n{response.text}')
            return False
            
    except requests.exceptions.RequestException as e:
        print(f'\n❌ ERROR: {e}')
        return False

if __name__ == '__main__':
    if len(sys.argv) > 1:
        print(f'Using backend URL: {sys.argv[1]}')
    else:
        print('Using default backend URL: http://localhost:8000')
        print('Usage: python test_photo_upload.py <backend_url>')
    
    success = test_upload()
    sys.exit(0 if success else 1)

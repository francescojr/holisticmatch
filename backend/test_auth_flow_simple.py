#!/usr/bin/env python
"""
Simplified End-to-End Flow Test - No emojis for Windows compatibility
Tests the complete authentication flow: Register -> Verify Email -> Login -> Get User
"""

import os
import django
import json
from django.utils import timezone

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
from django.contrib.auth.models import User
from professionals.models import Professional, EmailVerificationToken

def test_complete_flow():
    """Test the complete registration -> verification -> login flow"""
    
    client = Client()
    test_email = f"test_flow_{timezone.now().timestamp()}@example.com"
    test_password = "TestPassword@123"
    test_name = "Test Professional"
    test_bio = "A bio with at least 50 characters to pass validation. This is a longer bio that should satisfy the minimum."
    test_phone = "11999999999"
    test_city = "São Paulo"
    test_state = "SP"
    
    print("\n" + "="*70)
    print("AUTHENTICATION FLOW TEST")
    print("="*70)
    
    # STEP 1: REGISTER
    print("\n[STEP 1] Registering new professional...")
    
    register_data = {
        'email': test_email,
        'password': test_password,
        'name': test_name,
        'bio': test_bio,
        'services': ['Yoga', 'Meditação Guiada'],
        'price_per_session': 150.00,
        'attendance_type': 'presencial',
        'city': test_city,
        'state': test_state,
        'neighborhood': 'Centro',
        'whatsapp': test_phone,
    }
    
    register_response = client.post(
        '/api/v1/professionals/register/',
        data=json.dumps(register_data),
        content_type='application/json'
    )
    
    print(f"   Status: {register_response.status_code}")
    
    if register_response.status_code != 201:
        print(f"   ERROR: Expected 201, got {register_response.status_code}")
        print(f"   Response: {register_response.json()}")
        return False
    
    response_data = register_response.json()
    print(f"   Response fields: {list(response_data.keys())}")
    
    # Validate NEW response structure
    if 'access_token' not in response_data:
        print(f"   ERROR: Missing 'access_token' in response")
        return False
    if 'refresh_token' not in response_data:
        print(f"   ERROR: Missing 'refresh_token' in response")
        return False
    if 'user_id' not in response_data:
        print(f"   ERROR: Missing 'user_id' in response")
        return False
    if 'professional_id' not in response_data:
        print(f"   ERROR: Missing 'professional_id' in response")
        return False
    
    access_token = response_data['access_token']
    refresh_token = response_data['refresh_token']
    professional_id = response_data['professional_id']
    user_id = response_data['user_id']
    
    print(f"   SUCCESS: User registered")
    print(f"   access_token: {access_token[:50]}...")
    print(f"   refresh_token: {refresh_token[:50]}...")
    print(f"   user_id: {user_id}")
    print(f"   professional_id: {professional_id}")
    
    # Verify User created with is_active=False
    user = User.objects.get(email=test_email)
    if user.is_active:
        print(f"   ERROR: User should have is_active=False until verification")
        return False
    print(f"   SUCCESS: User created with is_active=False")
    
    # Get verification token
    email_token = EmailVerificationToken.objects.get(user=user)
    verification_token = email_token.token
    print(f"   SUCCESS: Email verification token created: {verification_token[:30]}...")
    
    # STEP 2: LOGIN BEFORE VERIFICATION (expect 403)
    print("\n[STEP 2] Attempting login BEFORE email verification (should fail)...")
    
    login_data = {
        'email': test_email,
        'password': test_password,
    }
    
    login_response = client.post(
        '/api/v1/auth/login/',
        data=json.dumps(login_data),
        content_type='application/json'
    )
    
    print(f"   Status: {login_response.status_code}")
    
    if login_response.status_code != 403:
        print(f"   ERROR: Expected 403 (unverified), got {login_response.status_code}")
        print(f"   Response: {login_response.json()}")
        return False
    
    print(f"   SUCCESS: Login blocked for unverified email (403)")
    
    # STEP 3: VERIFY EMAIL
    print("\n[STEP 3] Verifying email...")
    
    email_token_obj = EmailVerificationToken.objects.get(user=user)
    _, result = EmailVerificationToken.verify_token(email_token_obj.token)
    
    if result != 'verified':
        print(f"   ERROR: Verification failed with result: {result}")
        return False
    
    # Check is_active changed
    user.refresh_from_db()
    if not user.is_active:
        print(f"   ERROR: User should have is_active=True after verification")
        return False
    print(f"   SUCCESS: Email verified, user is_active=True")
    
    # STEP 4: LOGIN AFTER VERIFICATION
    print("\n[STEP 4] Logging in AFTER email verification (should succeed)...")
    
    login_response = client.post(
        '/api/v1/auth/login/',
        data=json.dumps(login_data),
        content_type='application/json'
    )
    
    print(f"   Status: {login_response.status_code}")
    
    if login_response.status_code != 200:
        print(f"   ERROR: Expected 200, got {login_response.status_code}")
        print(f"   Response: {login_response.json()}")
        return False
    
    login_data_response = login_response.json()
    print(f"   Response fields: {list(login_data_response.keys())}")
    
    if 'access' not in login_data_response:
        print(f"   ERROR: Missing 'access' in login response")
        return False
    if 'refresh' not in login_data_response:
        print(f"   ERROR: Missing 'refresh' in login response")
        return False
    
    login_access_token = login_data_response['access']
    print(f"   SUCCESS: Login successful after verification")
    print(f"   access token: {login_access_token[:50]}...")
    
    # STEP 5: TEST AUTHENTICATED REQUEST (GET /auth/me/)
    print("\n[STEP 5] Testing authenticated request to GET /auth/me/...")
    
    headers = {
        'HTTP_AUTHORIZATION': f'Bearer {login_access_token}',
        'content_type': 'application/json'
    }
    
    me_response = client.get(
        '/api/v1/auth/me/',
        **headers
    )
    
    print(f"   Status: {me_response.status_code}")
    
    if me_response.status_code != 200:
        print(f"   ERROR: Expected 200, got {me_response.status_code}")
        print(f"   Response: {me_response.json()}")
        return False
    
    me_data = me_response.json()
    print(f"   Response fields: {list(me_data.keys())}")
    
    # Validate user data returned
    required_fields = ['id', 'email', 'professional_id', 'full_name']
    for field in required_fields:
        if field not in me_data:
            print(f"   ERROR: Missing '{field}' in /auth/me/ response")
            return False
    
    if me_data['email'] != test_email:
        print(f"   ERROR: Email mismatch. Expected {test_email}, got {me_data['email']}")
        return False
    
    if me_data['id'] != user_id:
        print(f"   ERROR: User ID mismatch")
        return False
    
    if me_data['professional_id'] != professional_id:
        print(f"   ERROR: Professional ID mismatch")
        return False
    
    print(f"   SUCCESS: User profile retrieved via /auth/me/")
    print(f"   email: {me_data['email']}")
    print(f"   full_name: {me_data['full_name']}")
    print(f"   professional_id: {me_data['professional_id']}")
    
    print("\n" + "="*70)
    print("ALL TESTS PASSED!")
    print("="*70)
    return True

if __name__ == '__main__':
    success = test_complete_flow()
    exit(0 if success else 1)

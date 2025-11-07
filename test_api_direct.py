#!/usr/bin/env python3
"""
Direct API Test - Bypass Frontend
Tests backend and nginx directly without going through React frontend
"""

import requests
import json
import sys
from io import BytesIO
from PIL import Image
from datetime import datetime

def log_section(title):
    print(f"\n{'='*70}")
    print(f"  {title}")
    print(f"{'='*70}\n")

def log_test(test_num, desc):
    print(f"\n{'-'*70}")
    print(f"  TEST {test_num}: {desc}")
    print(f"{'-'*70}\n")

def test_api():
    backend_url = sys.argv[1] if len(sys.argv) > 1 else "https://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com"
    endpoint = f"{backend_url}/api/v1/professionals/register/"
    
    log_section("DIRECT API TEST - PHOTO UPLOAD")
    print(f"Backend URL: {backend_url}")
    print(f"Endpoint: {endpoint}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    # Test 1: JSON POST without photo
    log_test(1, "JSON POST - No Photo (Should work)")
    print("📝 Sending registration as JSON...")
    
    json_data = {
        "email": f"test_json_{datetime.now().timestamp()}@example.com",
        "password": "TestPass123!",
        "full_name": "Test JSON User",
        "state": "SP",
        "city": "Sao Paulo",
        "neighborhood": "Centro",
        "services": ["Meditaçao"],
        "price_per_session": "100.00",
        "attendance_type": "presencial",
        "bio": "Test user via JSON",
        "whatsapp": "11999999999"
    }
    
    try:
        response = requests.post(
            endpoint,
            json=json_data,
            timeout=30
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 201:
            print("✅ SUCCESS - Registration created!")
            data = response.json()
            print(f"   - User ID: {data.get('user_id')}")
            print(f"   - Professional ID: {data.get('professional_id')}")
        else:
            print(f"❌ FAILED - {response.status_code}")
            print(f"Response: {response.text[:200]}")
    except Exception as e:
        print(f"❌ ERROR: {e}")
    
    # Test 2: FormData without photo
    log_test(2, "FormData POST - No Photo (Should work)")
    print("📦 Sending registration as FormData...")
    
    formdata = {
        "email": f"test_formdata_{datetime.now().timestamp()}@example.com",
        "password": "TestPass123!",
        "full_name": "Test FormData User",
        "state": "SP",
        "city": "Sao Paulo",
        "neighborhood": "Centro",
        "services": '["Aromaterapia"]',
        "price_per_session": "100.00",
        "attendance_type": "presencial",
        "bio": "Test user via FormData",
        "whatsapp": "11999999999"
    }
    
    try:
        response = requests.post(
            endpoint,
            data=formdata,
            timeout=30
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 201:
            print("✅ SUCCESS - Registration created!")
            data = response.json()
            print(f"   - User ID: {data.get('user_id')}")
            print(f"   - Professional ID: {data.get('professional_id')}")
        else:
            print(f"❌ FAILED - {response.status_code}")
            print(f"Response: {response.text[:200]}")
    except Exception as e:
        print(f"❌ ERROR: {e}")
    
    # Test 3: FormData with photo
    log_test(3, "FormData POST - WITH Photo (Critical test)")
    print("📸 Creating test photo...")
    
    # Create test image
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    print(f"   - Photo size: {len(img_bytes.getvalue())} bytes")
    print(f"📦 Sending registration with photo as FormData...")
    
    formdata_with_photo = {
        "email": f"test_photo_{datetime.now().timestamp()}@example.com",
        "password": "TestPass123!",
        "full_name": "Test Photo User",
        "state": "SP",
        "city": "Sao Paulo",
        "neighborhood": "Centro",
        "services": '["Meditaçao"]',
        "price_per_session": "100.00",
        "attendance_type": "presencial",
        "bio": "Test user with photo",
        "whatsapp": "11999999999"
    }
    
    files = {
        "photo": ("test.png", img_bytes, "image/png")
    }
    
    try:
        response = requests.post(
            endpoint,
            data=formdata_with_photo,
            files=files,
            timeout=30
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 201:
            print("✅ SUCCESS - Photo upload worked!")
            data = response.json()
            print(f"   - User ID: {data.get('user_id')}")
            print(f"   - Professional ID: {data.get('professional_id')}")
            return True
        else:
            print(f"❌ FAILED - {response.status_code}")
            print(f"Response: {response.text[:500]}")
            
            # Analyze error
            if response.status_code == 413:
                print("\n⚠️  ERROR 413: Request Entity Too Large")
                print("   Nginx is rejecting the request for being too large")
                print("   Action: Check .ebextensions/nginx_upload.config")
            elif response.status_code == 400:
                print("\n⚠️  ERROR 400: Bad Request")
                print("   Backend rejected the request")
                try:
                    err_data = response.json()
                    print(f"   Details: {json.dumps(err_data, indent=2)}")
                except:
                    pass
            
            return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False
    
    log_section("RESULTS SUMMARY")
    print("If all tests passed:")
    print("  ✅ Backend is working correctly")
    print("  ✅ Nginx is accepting uploads")
    print("  ✅ Photo upload functionality works")
    print("")
    print("If Test 3 failed:")
    print("  ❌ Photo upload has issues - see error above")
    print("")
    print("Next steps:")
    print("  1. If Nginx error: Redeploy with: eb deploy")
    print("  2. If 400 error: Check serializer photo field")
    print("  3. If success: Problem is in frontend (React code)")

if __name__ == "__main__":
    try:
        test_api()
    except KeyboardInterrupt:
        print("\n\nTest interrupted")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nUnexpected error: {e}")
        sys.exit(1)

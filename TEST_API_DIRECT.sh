#!/bin/bash
# Test API directly without frontend
# This bypasses any frontend issues and tests the backend/nginx directly

BACKEND_URL="${1:-https://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com}"
ENDPOINT="$BACKEND_URL/api/v1/professionals/register/"

echo "================================================================"
echo "Testing Photo Upload - Direct API Test"
echo "================================================================"
echo ""
echo "🔗 Backend URL: $BACKEND_URL"
echo "📍 Endpoint: $ENDPOINT"
echo ""

# Test 1: Without photo (should work)
echo "TEST 1: Registration WITHOUT photo"
echo "-----------------------------------"
curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test_no_photo_'$(date +%s)'@example.com",
    "password":"TestPass123!",
    "full_name":"Test User No Photo",
    "state":"SP",
    "city":"Sao Paulo",
    "neighborhood":"Centro",
    "services":["Meditaçao"],
    "price_per_session":"100.00",
    "attendance_type":"presencial",
    "bio":"Test user without photo",
    "whatsapp":"11999999999"
  }' \
  -w "\n\n✅ Status Code: %{http_code}\n\n"

echo ""
echo ""

# Test 2: With multipart form data but without file (should work)
echo "TEST 2: Registration with FormData but NO file field"
echo "-----------------------------------------------------"
curl -X POST "$ENDPOINT" \
  -F "email=test_formdata_no_file_$(date +%s)@example.com" \
  -F "password=TestPass123!" \
  -F "full_name=Test FormData No File" \
  -F "state=SP" \
  -F "city=Sao Paulo" \
  -F "neighborhood=Centro" \
  -F 'services=["Aromaterapia"]' \
  -F "price_per_session=100.00" \
  -F "attendance_type=presencial" \
  -F "bio=Test without photo file" \
  -F "whatsapp=11999999999" \
  -w "\n\n✅ Status Code: %{http_code}\n\n"

echo ""
echo ""

# Test 3: With photo file (if a test image exists locally)
echo "TEST 3: Registration WITH photo file (if available)"
echo "---------------------------------------------------"

# Create a small test image if possible
if command -v python3 &> /dev/null; then
    python3 << 'PYTHON_EOF'
from PIL import Image
import os

# Create 1x1 red pixel image
img = Image.new('RGB', (100, 100), color='red')
img.save('/tmp/test_photo.png')
print("✅ Created test photo: /tmp/test_photo.png")
PYTHON_EOF

    if [ -f "/tmp/test_photo.png" ]; then
        curl -X POST "$ENDPOINT" \
          -F "email=test_with_photo_$(date +%s)@example.com" \
          -F "password=TestPass123!" \
          -F "full_name=Test With Photo" \
          -F "state=SP" \
          -F "city=Sao Paulo" \
          -F "neighborhood=Centro" \
          -F 'services=["Meditaçao"]' \
          -F "price_per_session=100.00" \
          -F "attendance_type=presencial" \
          -F "bio=Test with photo" \
          -F "whatsapp=11999999999" \
          -F "photo=@/tmp/test_photo.png" \
          -w "\n\n✅ Status Code: %{http_code}\n\n"
    fi
else
    echo "⚠️  Python3 not available for creating test image"
fi

echo ""
echo "================================================================"
echo "Test Complete!"
echo "================================================================"
echo ""
echo "Expected Results:"
echo "  Test 1: 201 Created (JSON POST without photo)"
echo "  Test 2: 201 Created (FormData without photo)"
echo "  Test 3: 201 Created (FormData with photo)"
echo ""
echo "If Test 3 fails with '413 Request Entity Too Large':"
echo "  - Nginx is not allowing large enough uploads"
echo "  - Check .ebextensions/nginx_upload.config"
echo "  - Redeploy with: eb deploy"
echo ""
echo "If Test 3 fails with '400 bad request - not a file':"
echo "  - Backend is not recognizing the file"
echo "  - Check DEFAULT_PARSER_CLASSES in settings.py"
echo "  - Check explicit ImageField in serializer"
echo ""

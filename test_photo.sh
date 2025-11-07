#!/bin/bash
# Photo Upload Test - Direct API Testing
# Usage: ./test_photo.sh [backend-url]

BACKEND="${1:-https://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com}"
ENDPOINT="$BACKEND/api/v1/professionals/register/"
TS=$(date +%s)

echo "========================================================"
echo "PHOTO UPLOAD - DIRECT API TEST"
echo "========================================================"
echo ""
echo "Backend: $BACKEND"
echo "Endpoint: $ENDPOINT"
echo ""

# Test 1: JSON POST without photo
echo "TEST 1: JSON POST - No Photo"
echo "──────────────────────────────"
echo ""

curl -s -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test_json_'$TS'@example.com",
    "password":"TestPass123!",
    "full_name":"Test JSON User",
    "state":"SP",
    "city":"Sao Paulo",
    "neighborhood":"Centro",
    "services":["Meditacao"],
    "price_per_session":"100.00",
    "attendance_type":"presencial",
    "bio":"Test user",
    "whatsapp":"11999999999"
  }' \
  -w "\nStatus: %{http_code}\n\n"

# Test 2: FormData without photo
echo ""
echo "TEST 2: FormData POST - No Photo"
echo "──────────────────────────────────"
echo ""

curl -s -X POST "$ENDPOINT" \
  -F "email=test_form_$TS@example.com" \
  -F "password=TestPass123!" \
  -F "full_name=Test Form User" \
  -F "state=SP" \
  -F "city=Sao Paulo" \
  -F "neighborhood=Centro" \
  -F 'services=["Aromaterapia"]' \
  -F "price_per_session=100.00" \
  -F "attendance_type=presencial" \
  -F "bio=Test" \
  -F "whatsapp=11999999999" \
  -w "\nStatus: %{http_code}\n\n"

# Test 3: FormData with photo
echo ""
echo "TEST 3: FormData POST - WITH Photo (CRITICAL TEST)"
echo "─────────────────────────────────────────────────"
echo ""

# Create test image (1x1 red PNG - minimal valid)
TMPIMG="/tmp/test_photo_$TS.png"
python3 << 'EOF'
from PIL import Image
import sys
ts = sys.argv[1]
img = Image.new('RGB', (100, 100), color='red')
img.save(f'/tmp/test_photo_{ts}.png')
EOF

if [ -f "$TMPIMG" ]; then
    echo "Test image created: $TMPIMG"
    echo ""
    
    curl -s -X POST "$ENDPOINT" \
      -F "email=test_photo_$TS@example.com" \
      -F "password=TestPass123!" \
      -F "full_name=Test Photo User" \
      -F "state=SP" \
      -F "city=Sao Paulo" \
      -F "neighborhood=Centro" \
      -F 'services=["Meditacao"]' \
      -F "price_per_session=100.00" \
      -F "attendance_type=presencial" \
      -F "bio=Test" \
      -F "whatsapp=11999999999" \
      -F "photo=@$TMPIMG" \
      -w "\nStatus: %{http_code}\n\n"
    
    rm -f "$TMPIMG"
else
    echo "ERROR: Could not create test image (Python3 + PIL required)"
fi

echo ""
echo "========================================================"
echo "Expected Results:"
echo "  Test 1: 201 (JSON POST without photo)"
echo "  Test 2: 201 (FormData without photo)"
echo "  Test 3: 201 (FormData WITH photo - CRITICAL)"
echo "========================================================"

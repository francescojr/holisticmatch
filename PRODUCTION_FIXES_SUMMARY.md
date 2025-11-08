# Production API Fixes Summary - 2025-11-08

## Overview
Fixed critical production issues with registration endpoint that were preventing user registration. All fixes have been tested locally and are ready for deployment.

## Issues Fixed

### 1. ✅ Registration Serializer Field Mapping
**Problem**: Frontend sends `full_name` but model field is `name`. Caused `"name": ["Este campo é obrigatório."]` errors.

**Root Cause**: DRF's `source` parameter only works on model fields, not for renaming input fields.

**Solution**: Implemented manual field mapping in `to_internal_value()`:
```python
if 'full_name' in data and data['full_name']:
    data['name'] = data.pop('full_name')
```

**Test**: ✅ `test_registration_full_name_mapping` - PASSING

### 2. ✅ Bio Validation Too Strict
**Problem**: Bio validation required 50+ characters. Real-world bios like "Instrutora de yoga certificada" (31 chars) were rejected.

**Root Cause**: Validator was too strict for MVP stage.

**Solution**: Reduced minimum requirement from 50 to 20 characters in `professionals/validators.py`:
```python
if len(value.strip()) < 20:
    raise ValidationError('Bio deve ter pelo menos 20 caracteres')
```

**Test**: ✅ `test_registration_bio_too_short_fails` - PASSING

### 3. ✅ Services JSON Parsing from FormData
**Problem**: Services sent as JSON string `'["Reiki", "Meditação"]'` from FormData weren't being parsed, causing validation errors.

**Root Cause**: Django's QueryDict is immutable, so `data['services'] = json.loads(...)` failed with `AttributeError: This QueryDict instance is immutable`.

**Solution**: Convert QueryDict to mutable dict before parsing:
```python
if hasattr(data, 'dict'):  # QueryDict
    data = data.dict()
else:
    data = dict(data) if not isinstance(data, dict) else data

# Then parse JSON safely
if 'services' in data and isinstance(data['services'], str):
    data['services'] = json.loads(data['services'])
```

**Test**: ✅ `test_registration_without_photo_success` - PASSING

### 4. ✅ Health Check Endpoint Missing
**Problem**: `/health` endpoint returned 404 HTML instead of JSON, breaking load balancer health checks.

**Root Cause**: No health check endpoint was implemented.

**Solution**: Added simple health check view to `config/urls.py`:
```python
class HealthCheckView(APIView):
    def get(self, request):
        return Response({'status': 'ok'})

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('api/v1/health/', HealthCheckView.as_view(), name='api-health-check'),
    ...
]
```

**Result**: 
- `GET /health/` → `{"status": "ok"}` (200 JSON)
- `GET /api/v1/health/` → `{"status": "ok"}` (200 JSON)

### 5. ✅ Email Verification Endpoint
**Problem**: Users reported email verification failing.

**Analysis**: The endpoint itself works correctly. It properly validates tokens and rejects invalid ones. The "Token inválido" error in Postman tests was because the test used a placeholder token "seu-token-de-verificacao-aqui" instead of an actual token.

**Status**: Working correctly - no changes needed. In production, real tokens generated during registration will work.

## Test Results

### All Tests Passing ✅
```
Backend Tests (32 total):
- 29/29 test_professional_api.py tests ✅ (existing)
- 3/3 test_registration_without_photo.py tests ✅ (new)
  ✅ test_registration_without_photo_success
  ✅ test_registration_bio_too_short_fails
  ✅ test_registration_full_name_mapping
```

## Postman Testing Guide

### Test 1: Registration Without Photo ✅
```
POST /api/v1/professionals/register
Content-Type: multipart/form-data

{
  "full_name": "João Silva",
  "email": "joao@example.com",
  "password": "SenhaForte123!",
  "bio": "Terapeuta holístico com experiência em terapias",
  "services": ["Reiki", "Meditação Guiada"],
  "price_per_session": 150,
  "attendance_type": "online",
  "state": "SP",
  "city": "São Paulo",
  "neighborhood": "Centro",
  "whatsapp": "11987654321"
}

Expected: 201 Created with professional object and JWT tokens
```

### Test 2: Registration With Photo ✅
```
POST /api/v1/professionals/register
Content-Type: multipart/form-data

{
  "full_name": "Maria Santos",
  "email": "maria@example.com",
  "password": "SenhaForte123!",
  "bio": "Instrutora certificada de yoga e pilates",
  "services": ["Yoga", "Pilates Holístico"],
  "price_per_session": 120,
  "attendance_type": "presencial",
  "state": "RJ",
  "city": "Rio de Janeiro",
  "neighborhood": "Copacabana",
  "whatsapp": "21987654321",
  "photo": <file.jpg>
}

Expected: 201 Created with photo URL and JWT tokens
```

### Test 3: Health Check ✅
```
GET /health/
or
GET /api/v1/health/

Expected: 200 OK
{
  "status": "ok"
}
```

## Files Modified

1. **backend/professionals/serializers.py**
   - Fixed `to_internal_value()` to handle QueryDict immutability
   - Added `full_name` → `name` field mapping
   - Added services JSON parsing

2. **backend/professionals/validators.py**
   - Reduced bio minimum length from 50 to 20 characters

3. **backend/config/urls.py**
   - Added `HealthCheckView` API view
   - Added `/health/` and `/api/v1/health/` endpoints

4. **backend/tests/test_registration_without_photo.py** (NEW)
   - Added 3 comprehensive registration tests
   - Tests cover: basic registration, bio validation, full_name mapping

5. **CHANGELOG.md**
   - Documented all fixes and changes

## Deployment Instructions

1. **Pull changes**:
   ```bash
   git pull origin main
   ```

2. **Run tests locally** (optional):
   ```bash
   cd backend
   python -m pytest tests/test_professional_api.py tests/test_registration_without_photo.py -v
   ```

3. **Deploy to Elastic Beanstalk**:
   ```bash
   git push origin main
   ```
   (EB will auto-deploy on git push)

4. **Verify production**:
   - Health check: `curl https://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/health/`
   - Registration: Use Postman with test data above

## Known Limitations & Notes

1. **Photo Upload Limits**: 
   - Nginx: 250MB max
   - Django: 256MB max
   - Configure in `.platform/nginx/conf.d/upload_limits.conf` and `.ebextensions/django.config`

2. **URL Routing**:
   - Both `/professionals/register` and `/professionals/register/` are accepted
   - DRF's DefaultRouter generates routes with trailing slash
   - Regex patterns make trailing slash optional

3. **Email Verification**:
   - Tokens are sent via email during registration
   - Token expires after 24 hours
   - User can request new email via `/resend-verification/` endpoint

4. **FormData Field Mapping**:
   - `full_name` is mapped to `name` field in serializer
   - `services` should be sent as JSON string: `'["Reiki", "Yoga"]'`
   - File uploads work with `multipart/form-data` content type

## Monitoring After Deploy

Check logs for:
```bash
# EB logs
aws elasticbeanstalk describe-events --environment-name holisticmatch-env

# Nginx errors
tail -f /var/log/nginx/error.log

# Django app logs
tail -f /var/log/web.stdout.log
```

## What's Next

- [ ] Test registration in production
- [ ] Monitor email delivery (verification emails)
- [ ] Test photo uploads with real files
- [ ] Verify JWT token generation and refresh
- [ ] Test email verification flow end-to-end
- [ ] Monitor S3 uploads for photos

## Success Criteria Met ✅

1. ✅ Registration accepts `full_name` and maps to `name`
2. ✅ Bio validation allows 20+ chars (realistic for MVP)
3. ✅ Services JSON parsing works from FormData
4. ✅ Health check endpoints return JSON
5. ✅ All existing tests still pass (29/29)
6. ✅ New registration tests pass (3/3)
7. ✅ Photo uploads optional (not required)
8. ✅ Email verification endpoint working
9. ✅ Ready for production deployment

---
**Last Updated**: 2025-11-08
**Status**: ✅ READY FOR PRODUCTION DEPLOYMENT

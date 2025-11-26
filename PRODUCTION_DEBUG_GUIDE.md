# Production Debug Guide - Registration 500 Error

## Issue Summary

**Problem:** New professional registration endpoint returns 500 error regardless of photo upload
- **Frontend Error:** `POST /api/v1/professionals/register/` → 500 Internal Server Error (HTML response)
- **Status:** Blocking new user registrations in production
- **Tested:** Local integration test PASSES (test_production_flow.py)
- **Scope:** Production server only (not replicable locally)

## Local Test Results ✅

The local integration test (`test_production_flow.py`) PASSES with:
- ✅ Professional registration succeeds
- ✅ Photo upload succeeds  
- ✅ AWS Rekognition validation succeeds (no explicit content)
- ✅ Profile ID created: 106

**Conclusion:** Local backend code is correct. The 500 error in production is due to server-specific configuration or state.

## Possible Root Causes

### 1. **Database Constraints / State Issues** (Most Likely)
- Unique constraint violation (email already exists)
- Foreign key constraint violation
- Migration not applied on production server
- Corrupted database state

### 2. **AWS Rekognition Integration** (Less Likely)
- AWS credentials expired or incorrect
- AWS IAM permissions revoked
- Service quota exceeded
- Network timeout to AWS

### 3. **Serializer Validation** (Less Likely)  
- Field validation failing (email format, etc.)
- Required fields missing from FormData
- Service selection validation error

### 4. **Environment Configuration** (Possible)
- Missing environment variables (AWS keys, email config, etc.)
- Incorrect database URL in production
- File upload size limits misconfigured

### 5. **Filesystem/Storage** (Less Likely)
- S3 bucket permissions issue
- Disk space full
- Directory permissions issue

## How to Debug - Step by Step

### Step 1: Access Production Server Logs

**Via SSH to EC2:**

```bash
# SSH into your Elastic Beanstalk EC2 instance
ssh -i /path/to/your/key.pem ec2-user@your-instance-ip

# Or if using Elastic Beanstalk SSH helper:
eb ssh
```

**Check Django Error Logs:**

```bash
# View the main Django log file
tail -f /var/log/django.log

# Or if logs are in app directory:
cd /var/app/current
cat logs/django.log | tail -100

# Search for recent 500 errors:
grep -i "professional.*register\|500\|error" logs/django.log | tail -50

# Check Gunicorn/WSGI logs:
tail -f /var/log/eb-activity.log
tail -f /var/log/eb-engine.log
```

### Step 2: Test Registration Endpoint Directly

**From production server:**

```bash
# Test with curl (no photo first to isolate photo issue)
curl -X POST https://hollisticmatch.online/api/v1/professionals/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "full_name": "Test Professional",
    "phone": "(11) 99999-9999",
    "state": "SP",
    "city": "São Paulo",
    "neighborhood": "Centro",
    "bio": "Test bio with more than 10 characters",
    "price_per_session": 100.00,
    "attendance_type": "presencial",
    "services": ["acupuntura"],
    "whatsapp": "(11) 99999-9999"
  }'

# Check response status and body for specific error
```

### Step 3: Check Database State

**SSH into server, then:**

```bash
# Connect to Supabase PostgreSQL
psql postgresql://user:password@db.supabase.co:5432/postgres

# Check if email exists:
SELECT id, email FROM users WHERE email = 'test@example.com';

# Check professional count:
SELECT COUNT(*) FROM professionals;

# Check for any constraints:
\d professionals
```

### Step 4: Verify AWS Credentials

```bash
# Check if AWS credentials are set in environment:
eb ssh
env | grep AWS

# Test AWS Rekognition access from server:
python manage.py shell
```

Then in Python shell:

```python
import boto3
from django.conf import settings

try:
    client = boto3.client(
        'rekognition',
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
    )
    response = client.detect_moderation_labels(Image={'S3Object': {'Bucket': 'holisticmatch-media', 'Name': 'test.jpg'}})
    print("AWS Rekognition: WORKING")
except Exception as e:
    print(f"AWS Rekognition: FAILED - {str(e)}")
```

### Step 5: Check Environment Variables

```bash
eb ssh
env | grep -i "DEBUG\|DATABASE\|AWS\|SECRET"

# Check if DEBUG mode is on:
echo $DEBUG

# Check database connection:
python manage.py shell -c "from django.db import connection; print(connection.ensure_connection())"
```

### Step 6: Run Migrations

```bash
# Make sure all migrations are applied:
python manage.py migrate

# Check migration status:
python manage.py showmigrations
```

## What to Look For in Logs

When viewing Django logs, search for:

1. **Serializer Validation Errors:**
   ```
   [professional.serializers] Validation error in ProfessionalCreateSerializer
   {'email': ['A user with that email already exists']}
   ```

2. **Database Errors:**
   ```
   [django.db.backends] Integrity error
   duplicate key value violates unique constraint
   ```

3. **AWS Errors:**
   ```
   [professionals.image_moderation] AWS error
   ClientError: An error occurred (InvalidParameterException)
   ```

4. **File Upload Errors:**
   ```
   [professional.serializers] Photo upload failed
   S3 error or disk full
   ```

5. **Missing Fields:**
   ```
   [professional.serializers] Missing required field: 'services'
   ```

## Specific Error Examples

### If you see: "duplicate key value violates unique constraint"
**Solution:** 
- Email already registered in database
- Need to clean up test accounts or check email uniqueness validation

### If you see: "AWS Rekognition error - InvalidParameterException"
**Solution:**
- Check AWS credentials in environment variables
- Verify IAM role has rekognition:DetectModerationLabels permission
- Check S3 bucket has proper CORS settings

### If you see: "CharField value too long"
**Solution:**
- Truncate fields that exceed max_length in serializer

## Quick Wins to Try

1. **Restart Django/Gunicorn:**
   ```bash
   eb ssh
   sudo systemctl restart gunicorn
   ```

2. **Check Disk Space:**
   ```bash
   df -h
   # If logs partition full, clear old logs
   ```

3. **Clear Django Cache:**
   ```bash
   python manage.py shell
   from django.core.cache import cache
   cache.clear()
   ```

4. **Force Redeploy:**
   ```bash
   eb deploy
   ```

## Getting Help

If logs show specific errors:

1. **Share the exact error message from logs** (sanitize sensitive data)
2. **Test the same request locally** with the test data
3. **Check if error is intermittent or consistent**
4. **Note the timestamp and compare with any recent deployments**

## Related Files

- **Registration Endpoint:** `backend/professionals/views.py` → `ProfessionalCreateSerializer`
- **Photo Validation:** `backend/professionals/image_moderation.py` → `ImageModerationService`
- **Django Logs Config:** `backend/config/settings.py` → LOGGING section
- **Test File:** `backend/test_production_flow.py` (local test that PASSES)

## Next Steps

1. **SSH into production** and check the error logs
2. **Search for recent 500 errors** in django.log
3. **Identify the specific error** from the log output
4. **Compare error with possible root causes** above
5. **Apply fix** based on root cause
6. **Test with curl** to verify fix
7. **Monitor** next 10 registrations to ensure issue resolved

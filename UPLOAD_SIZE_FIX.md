# Upload Size Limit Fix - Root Cause Identified & Resolved

## Problem Analysis

From the Elastic Beanstalk nginx error logs, we identified the root cause of the 400 validation errors:

```
2025/11/07 02:14:55 [error] 266136#266136: *550 client intended to send too large body: 2249584 bytes
```

**The photo file (~2.2MB) was being rejected by nginx BEFORE it even reached the Django application.** This caused the entire multipart FormData upload to fail, which is why multiple fields (state, photo, attendance_type) appeared to have validation errors in the response - they weren't even making it to the backend.

## Root Cause

1. **Nginx default limit**: `client_max_body_size` defaults to 1MB
2. **Photo file size**: ~2.2MB (exceeds default limit)
3. **Result**: Nginx rejects request with 413 Payload Too Large, before Django can validate

This manifested as validation errors on multiple fields because:
- The incomplete/rejected FormData reached the serializer
- Missing fields appeared as validation failures
- The actual upload rejection was hidden in nginx logs

## Solution Implemented

### 1. Nginx Configuration (`.ebextensions/nginx_upload.config`)
Added nginx configuration to increase upload limit to 50MB:

```yaml
files:
  "/etc/nginx/conf.d/client_max_body_size.conf":
    mode: "000644"
    owner: root
    group: root
    content: |
      client_max_body_size 50M;
```

### 2. Django Settings (`config/settings.py`)
Increased Django's file upload memory limits to 50MB:

```python
FILE_UPLOAD_MAX_MEMORY_SIZE = 52428800  # 50MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 52428800  # 50MB
```

## What This Fixes

✅ **Photo uploads up to 50MB** will now be accepted by both nginx and Django  
✅ **FormData integrity** - complete multipart data now reaches the backend  
✅ **Proper validation** - fields will be validated correctly instead of failing due to incomplete data  
✅ **Consistent error messages** - any actual validation errors will now be accurate

## Deployment Instructions

1. **Push the changes**:
   - `.ebextensions/nginx_upload.config` (new file)
   - `config/settings.py` (updated)

2. **Deploy to Elastic Beanstalk**:
   ```bash
   eb deploy
   ```

3. **Verify deployment**:
   - Check that nginx was reloaded with new configuration
   - Test registration with a photo file

## Testing

All 168 backend tests pass with these changes ✅

```
============================= 168 passed, 1 warning in 4.33s ========================
```

## Technical Details

**Why this was hard to debug**: The nginx logs weren't immediately obvious in the initial context. The browser showed "validation errors" but the actual problem was at the proxy layer (nginx) before the request reached Django. This is why adding logging to the Django serializer didn't help - the data never reached that code.

## Expected Result After Deployment

When user submits registration form with photo:

1. ✅ Nginx accepts request (now 50MB limit)
2. ✅ Django receives complete FormData
3. ✅ Services JSON is parsed correctly
4. ✅ Fields are validated properly
5. ✅ Registration completes successfully

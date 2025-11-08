# Upload Configuration - Final Solution

## 🎯 Problem
- Frontend tries to upload 2.2MB photo
- Nginx returns **413 Request Entity Too Large**
- Root cause: `client_max_body_size` was using default (1MB), not 250MB
- Elastic Beanstalk was overriding our custom nginx configs

## ✅ Solution: Clear Hierarchy

### 1. **Nginx (EB manages)**
- **Location**: `.platform/nginx/conf.d/upload_limits.conf`
- **Priority**: Highest - EB loads this BEFORE its defaults
- **Value**: `client_max_body_size 250M;`
- **Why**: `.platform/` is processed by EB as custom proxy configuration

### 2. **Django (Django manages)**
- **Location**: `config/settings.py`
- **Backup**: `.ebextensions/django.config` (env vars)
- **Values**: 
  - `FILE_UPLOAD_MAX_MEMORY_SIZE = 262144000` (256MB)
  - `DATA_UPLOAD_MAX_MEMORY_SIZE = 262144000` (256MB)
- **Why**: Django validates before passing to nginx

### 3. **Environment Variables (EB backup)**
- **Location**: `.ebextensions/django.config`
- **Fallback**: If settings.py not loaded
- **Used by**: Django when running on EB

## 📋 Configuration Files

```
backend/
├── .platform/
│   └── nginx/
│       └── conf.d/
│           └── upload_limits.conf         ← Nginx config (handled by EB)
├── .ebextensions/
│   ├── django.config                       ← Django env vars (EB)
│   ├── https.config                        ← HTTPS/health checks
│   ├── nginx_upload.config                 ← BACKUP/FALLBACK (lower priority)
│   └── security-group.config               ← AWS security
├── config/
│   └── settings.py                         ← Django settings (fallback)
```

## 🔄 Processing Order (Elastic Beanstalk)

1. **`.platform/nginx/`** ← Applied FIRST (highest priority)
2. **`.ebextensions/*`** ← Applied second
3. **Default EB config** ← Applied last (lowest priority)

## ✨ What Happens Now

1. User uploads 2.2MB photo
2. **Nginx** checks: `client_max_body_size 250M` ✅ (from `.platform/`)
3. **Django** checks: `FILE_UPLOAD_MAX_MEMORY_SIZE 256MB` ✅ (from `settings.py`)
4. **Upload succeeds!** No more 413 errors

## 🚀 Deployment

```bash
cd backend
eb deploy holisticmatch-env --verbose
```

**What EB will do:**
1. Stop old app
2. Deploy new code (includes `.platform/nginx/conf.d/upload_limits.conf`)
3. EB loads `.platform/nginx/` FIRST
4. EB loads `.ebextensions/` configs
5. Nginx reloads with **all** limits: 250M (nginx) + 256MB (Django)
6. Django starts with env vars
7. App is ready ✅

## 🧪 Verify After Deployment

```bash
python verify_upload_config.py
```

Or test manually:
- Upload 2-3MB image from frontend
- Should work without 413 error
- Check logs: `eb logs -a`

## 📝 Notes

- **No conflicts**: Each layer manages what it should
- **No overwrites**: `.platform/` has priority, so EB won't override
- **Fallback stack**: Settings.py + env vars ensure Django works locally too
- **Logging**: Added to nginx for debugging large uploads

## ✅ Checklist Before Deploy

- [ ] `.platform/nginx/conf.d/upload_limits.conf` exists
- [ ] `.ebextensions/django.config` has env vars set
- [ ] `config/settings.py` has FILE_UPLOAD_MAX_MEMORY_SIZE set
- [ ] Local tests pass: `pytest tests/test_professional_api.py -v`
- [ ] Cities endpoint works: `/api/v1/professionals/cities/SP/`
- [ ] Ready to deploy: `eb deploy holisticmatch-env --verbose`

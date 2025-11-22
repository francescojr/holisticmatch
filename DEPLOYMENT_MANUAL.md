# 🚀 Manual Deployment Guide

## Overview
This guide explains how to manually deploy the HolisticMatch application to AWS EC2.

**Important:** After each code deployment, you MUST run migrations to apply database schema changes.

---

## 📋 Pre-Deployment Checklist

- ✅ All tests passing locally: `pytest tests/ -v`
- ✅ Code changes committed (if using version control)
- ✅ CHANGELOG.md updated with semantic versioning
- ✅ README.md updated with new features
- ✅ No uncommitted sensitive data (secrets, passwords, etc.)

---

## 🔄 Deployment Steps

### Step 1: SSH into Production Server

```bash
# Connect to AWS EC2 instance
ssh -i your-key-pair.pem ubuntu@your-ec2-instance-ip

# Or using Elastic Beanstalk SSH (if configured)
eb ssh
```

### Step 2: Navigate to Project Directory

```bash
cd /path/to/holisticmatch/backend
# Common paths:
# - Elastic Beanstalk: /var/app/current
# - Manual EC2: ~/holisticmatch/backend
```

### Step 3: Pull Latest Code

```bash
# If using git
git pull origin main

# Or manually upload new files via SCP
# scp -i key.pem -r ./backend ubuntu@ip:/path/to/project
```

### Step 4: Run Database Migrations

```bash
# Apply pending migrations
python manage.py migrate --verbosity=2

# Or use the migration script
bash run_migrations.sh production
```

**What this does:**
- Applies all pending migrations from `professionals/migrations/`
- Creates/modifies database tables as needed
- For v1.0.7+: Adds the `na_contencao` field to Professional model

**Example output:**
```
Migrations to perform:
  Applying professionals.0007_add_na_contencao_field... OK
```

### Step 5: Collect Static Files (if needed)

```bash
python manage.py collectstatic --noinput
```

### Step 6: Restart Application

**For Gunicorn:**
```bash
sudo systemctl restart gunicorn
# or
sudo service gunicorn restart
```

**For Elastic Beanstalk:**
```bash
eb deploy
# or
sudo systemctl restart supervisord
```

**For Nginx:**
```bash
sudo systemctl restart nginx
```

### Step 7: Verify Deployment

```bash
# Check application health
curl http://localhost:8000/api/v1/professionals/

# Or check production URL
curl https://hollisticmatch.online/api/v1/professionals/

# Verify migrations were applied
python manage.py showmigrations professionals
```

**Expected response includes new fields:**
```json
{
  "count": 15,
  "results": [
    {
      "id": 1,
      "name": "João Silva",
      "is_active": true,
      "na_contencao": true,  // ← New field should be present
      ...
    }
  ]
}
```

---

## ⚠️ Troubleshooting

### Issue: Fields are `undefined` in API Response

**Cause:** Migrations not applied to production database.

**Solution:**
```bash
# SSH into server and run:
python manage.py migrate professionals
# Then restart application
sudo systemctl restart gunicorn
```

### Issue: Migration Errors

**Check migration status:**
```bash
python manage.py showmigrations
```

**If stuck on a migration:**
```bash
# Show detailed SQL
python manage.py migrate professionals --plan

# Roll back specific migration (dangerous!)
python manage.py migrate professionals 0006  # Rolls back to 0006
```

### Issue: Database Connection Error

**Verify environment variables:**
```bash
echo $DATABASE_URL
# Should output: postgresql://user:password@host:port/dbname
```

---

## 📊 Version History - Migration Timeline

| Version | Migration | Status | Production |
|---------|-----------|--------|-----------|
| v1.0.6  | 0001-0006 | ✅ Deployed | Applied |
| v1.0.7  | 0007_add_na_contencao_field | ⏳ Pending | **Requires manual run** |

---

## 🔐 Environment Variables Required

Ensure these are set on production server:

```bash
# Django
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=hollisticmatch.online,www.hollisticmatch.online,IP_ADDRESS

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://user:pass@db.supabase.co:5432/postgres

# AWS S3
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_STORAGE_BUCKET_NAME=holisticmatch-media
AWS_S3_REGION_NAME=sa-east-1

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# API
CORS_ALLOWED_ORIGINS=https://holisticmatch.vercel.app
```

---

## ✅ Post-Deployment Verification

1. ✅ Check API returns `is_active` and `na_contencao` fields
2. ✅ Frontend displays professionals correctly
3. ✅ Email verification flow working
4. ✅ No console errors in browser
5. ✅ Application logs show no migration errors

**Monitor logs:**
```bash
# Gunicorn logs
tail -f /var/log/gunicorn.log

# Application logs
tail -f /home/ubuntu/holisticmatch/backend/logs/app.log

# Nginx errors (if using proxy)
tail -f /var/log/nginx/error.log
```

---

## 📝 Deployment Record

Keep a record of deployments for auditing:

```
Date: 2025-11-22
Version: v1.0.7
Changes: Added na_contencao field to Professional model
Migrations: 0007_add_na_contencao_field.py
Status: ✅ Successful
Time: 14:30 UTC
```

---

## 🆘 Emergency Rollback

If deployment fails critically:

```bash
# 1. Stop application
sudo systemctl stop gunicorn

# 2. Revert to previous code
git checkout main~1  # or manually restore files

# 3. Restart application
sudo systemctl start gunicorn

# 4. Check logs
tail -f /var/log/gunicorn.log
```

---

**Last Updated:** 2025-11-22 | Version: 1.0.7

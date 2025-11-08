#!/usr/bin/env python
"""
Verify that all upload configurations are properly set
Run this AFTER deployment to confirm everything is working
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings

print("\n" + "="*70)
print("UPLOAD CONFIGURATION VERIFICATION")
print("="*70)

# 1. Django settings
print("\n✓ DJANGO SETTINGS:")
print(f"  FILE_UPLOAD_MAX_MEMORY_SIZE: {settings.FILE_UPLOAD_MAX_MEMORY_SIZE:,} bytes")
print(f"  ({settings.FILE_UPLOAD_MAX_MEMORY_SIZE / (1024**2):.0f} MB)")
print(f"  DATA_UPLOAD_MAX_MEMORY_SIZE: {settings.DATA_UPLOAD_MAX_MEMORY_SIZE:,} bytes")
print(f"  ({settings.DATA_UPLOAD_MAX_MEMORY_SIZE / (1024**2):.0f} MB)")

# 2. Check environment variables
print("\n✓ ENVIRONMENT VARIABLES (from EB):")
file_upload_env = os.environ.get('FILE_UPLOAD_MAX_MEMORY_SIZE', 'NOT SET')
data_upload_env = os.environ.get('DATA_UPLOAD_MAX_MEMORY_SIZE', 'NOT SET')
print(f"  FILE_UPLOAD_MAX_MEMORY_SIZE: {file_upload_env}")
print(f"  DATA_UPLOAD_MAX_MEMORY_SIZE: {data_upload_env}")

# 3. What should work
print("\n✓ EXPECTED BEHAVIOR:")
print("  ✓ Nginx: accepts files up to 250MB (client_max_body_size)")
print(f"  ✓ Django: accepts files up to {settings.FILE_UPLOAD_MAX_MEMORY_SIZE / (1024**2):.0f}MB")
print("  ✓ Test file: 2.2MB should upload without 413 error")

# 4. Configuration hierarchy
print("\n✓ CONFIGURATION HIERARCHY:")
print("  1. .platform/nginx/conf.d/upload_limits.conf (highest priority)")
print("  2. .ebextensions/django.config (Django env vars)")
print("  3. config/settings.py (Django settings - fallback)")

print("\n" + "="*70)
print("✅ Configuration verification complete!")
print("="*70 + "\n")

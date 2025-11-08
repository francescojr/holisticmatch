#!/usr/bin/env python
"""
Simple email test - no emojis for PowerShell compatibility
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings

print("\n" + "="*80)
print("EMAIL TEST")
print("="*80)

print("\n1. EMAIL CONFIGURATION:")
print(f"   EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
print(f"   DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
print(f"   RESEND_API_KEY: {'YES' if settings.RESEND_API_KEY else 'NO'}")

print("\n2. FINDING USER:")
user = User.objects.filter(email='datajack13@gmail.com').first()
if user:
    print(f"   SUCCESS - User ID: {user.id}, Email: {user.email}")
else:
    print("   FAILED - User not found")
    exit(1)

print("\n3. SENDING EMAIL:")
try:
    result = send_mail(
        subject='Test Email',
        message='This is a test email from HolisticMatch',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )
    print(f"   SUCCESS - Email sent! Result: {result}")
except Exception as e:
    print(f"   FAILED - {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "="*80 + "\n")

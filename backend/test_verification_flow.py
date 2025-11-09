#!/usr/bin/env python
"""
Test the complete verification flow
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from professionals.models import EmailVerificationToken

# Find the user
email = 'francesco@hcunit.com.br'
user = User.objects.filter(email=email).first()

if not user:
    print(f"❌ User {email} not found!")
    exit(1)

print(f"\n{'='*60}")
print(f"User Status BEFORE verification")
print(f"{'='*60}")
print(f"Email: {user.email}")
print(f"ID: {user.id}")
print(f"is_active: {user.is_active}")
print(f"is_staff: {user.is_staff}")
print(f"is_superuser: {user.is_superuser}")

# Get the token
token_obj = EmailVerificationToken.objects.filter(user=user).first()
if not token_obj:
    print(f"❌ No token found for user!")
    exit(1)

print(f"\nToken Details:")
print(f"  Token (first 30 chars): {token_obj.token[:30]}...")
print(f"  is_verified: {token_obj.is_verified}")
print(f"  is_valid(): {token_obj.is_valid()}")
print(f"  created_at: {token_obj.created_at}")
print(f"  expires_at: {token_obj.expires_at}")

# Test verification
print(f"\n{'='*60}")
print(f"SIMULATING VERIFICATION")
print(f"{'='*60}")

# First, reset is_active and is_verified to simulate fresh state
print(f"\n1. Resetting to initial state...")
user.is_active = False
user.save()
token_obj.is_verified = False
token_obj.save()

print(f"   User is_active: {user.is_active}")
print(f"   Token is_verified: {token_obj.is_verified}")

# Now call verify_token
print(f"\n2. Calling verify_token()...")
email_token, result = EmailVerificationToken.verify_token(token_obj.token)

print(f"   Result: {result}")
print(f"   email_token: {email_token}")

if result == 'verified':
    print(f"   ✅ Verification returned 'verified'")
else:
    print(f"   ❌ Verification returned '{result}' - EXPECTED 'verified'!")

# Check final state
print(f"\n3. Checking final state from database...")
user_refreshed = User.objects.get(id=user.id)
token_refreshed = EmailVerificationToken.objects.get(id=token_obj.id)

print(f"   User is_active: {user_refreshed.is_active}")
print(f"   Token is_verified: {token_refreshed.is_verified}")

if user_refreshed.is_active and token_refreshed.is_verified:
    print(f"\n{'='*60}")
    print(f"✅ VERIFICATION FLOW WORKING CORRECTLY!")
    print(f"{'='*60}")
else:
    print(f"\n{'='*60}")
    print(f"❌ VERIFICATION FLOW HAS ISSUES!")
    print(f"{'='*60}")
    if not user_refreshed.is_active:
        print(f"  - User is_active is still False (should be True)")
    if not token_refreshed.is_verified:
        print(f"  - Token is_verified is still False (should be True)")

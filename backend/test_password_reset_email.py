#!/usr/bin/env python
"""
Quick test to check if password reset email is being sent
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from professionals.serializers import PasswordResetRequestSerializer

# Create test user
test_email = 'testuser123@example.com'
try:
    user = User.objects.get(email=test_email)
    user.delete()
except User.DoesNotExist:
    pass

user = User.objects.create_user(
    username=test_email,
    email=test_email,
    password='testpass123'
)

print(f"✅ Created test user: {test_email}")

# Test password reset
data = {'email': test_email}
serializer = PasswordResetRequestSerializer(data=data)

if serializer.is_valid():
    try:
        serializer.save()
        print("✅ PasswordResetRequestSerializer.save() completed")
        print(f"   (This should have sent an email via Resend)")
    except Exception as e:
        print(f"❌ Error during save(): {e}")
else:
    print(f"❌ Serializer validation failed: {serializer.errors}")

# Cleanup
user.delete()
print(f"✅ Test user deleted")

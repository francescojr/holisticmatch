#!/usr/bin/env python
"""
Test password reset flow end-to-end
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from django.core.mail import outbox as django_outbox
from rest_framework.test import APIClient
import json

# Clean up test user
test_email = 'resettest@example.com'
try:
    user = User.objects.get(email=test_email)
    user.delete()
except User.DoesNotExist:
    pass

# Create and verify a user
user = User.objects.create_user(
    username=test_email,
    email=test_email,
    password='TestPass@123',
    is_active=True  # Must be active to test password reset
)

print(f"✅ Created test user: {test_email}")
print(f"   is_active: {user.is_active}")

# Test password reset via API
client = APIClient()

# Request password reset
response = client.post('/api/v1/professionals/password-reset/', {
    'email': test_email
}, format='json')

print(f"\n📧 Password Reset Request Response:")
print(f"   Status: {response.status_code}")
print(f"   Data: {response.data}")

# Check if email was sent
if hasattr(response, 'wsgi_request'):
    print(f"\n✉️  Emails sent (wsgi): {len(django_outbox)}")
    if django_outbox:
        for email in django_outbox:
            print(f"     - To: {email.to}")
            print(f"     - Subject: {email.subject}")

print("\n✅ Test complete")

# Cleanup
user.delete()

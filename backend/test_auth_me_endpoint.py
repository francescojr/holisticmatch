#!/usr/bin/env python
"""
Test the /auth/me/ endpoint
"""
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.test import APIRequestFactory
from authentication.views import CurrentUserView
from rest_framework_simplejwt.tokens import RefreshToken

# Create a factory and view
factory = APIRequestFactory()
view = CurrentUserView.as_view()

# Get the user
user = User.objects.get(email='francesco@hcunit.com.br')
print(f"\nUser: {user.email}")
print(f"User ID: {user.id}")
print(f"User has professional: {hasattr(user, 'professional')}")

# Generate tokens
refresh = RefreshToken.for_user(user)
access_token = str(refresh.access_token)

print(f"\nAccess Token: {access_token[:50]}...")

# Create a request with auth header
request = factory.get('/auth/me/', HTTP_AUTHORIZATION=f'Bearer {access_token}')

# Call the view
response = view(request)

print(f"\nResponse Status: {response.status_code}")
print(f"Response Data: {json.dumps(response.data, indent=2)}")

# Expected
print(f"\nExpected professional_id: {user.professional.id}")
if response.status_code == 200:
    if 'professional_id' in response.data:
        print(f"✅ professional_id in response: {response.data['professional_id']}")
    else:
        print(f"❌ professional_id NOT in response!")
else:
    print(f"❌ Response status is not 200!")

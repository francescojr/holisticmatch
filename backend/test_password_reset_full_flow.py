#!/usr/bin/env python
"""
Full flow test: Password reset request and confirmation
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from professionals.serializers import PasswordResetRequestSerializer, PasswordResetConfirmSerializer
from professionals.models import PasswordResetToken

# 1. Create test user (must be active to login)
test_email = 'reset_test_user@example.com'
try:
    user = User.objects.get(email=test_email)
    user.delete()
except User.DoesNotExist:
    pass

user = User.objects.create_user(
    username=test_email,
    email=test_email,
    password='OldPassword123',
    is_active=True  # Must be active to use password reset
)

print(f"✅ Created test user: {test_email}")

# 2. Request password reset
print("\n📧 Step 1: Requesting password reset...")
reset_data = {'email': test_email}
serializer = PasswordResetRequestSerializer(data=reset_data)

if serializer.is_valid():
    try:
        reset_token = serializer.save()
        if reset_token:
            print(f"✅ Password reset token created: {reset_token.token[:20]}...")
            print(f"   Token valid: {reset_token.is_valid()}")
            print(f"   Token expires at: {reset_token.expires_at}")
        else:
            print("❌ No token returned (email might not exist)")
    except Exception as e:
        print(f"❌ Error during save(): {e}")
        import traceback
        traceback.print_exc()
else:
    print(f"❌ Serializer validation failed: {serializer.errors}")

# 3. Confirm password reset
print("\n🔐 Step 2: Confirming password reset with new password...")
try:
    token_obj = PasswordResetToken.objects.get(user=user)
    confirm_data = {
        'token': token_obj.token,
        'password': 'NewPassword456',
        'password_confirm': 'NewPassword456'
    }
    
    confirm_serializer = PasswordResetConfirmSerializer(data=confirm_data)
    if confirm_serializer.is_valid():
        confirm_serializer.save()
        print("✅ Password reset confirmed!")
        
        # Verify new password works
        user.refresh_from_db()
        if user.check_password('NewPassword456'):
            print("✅ New password verified - login will work!")
        else:
            print("❌ New password doesn't work")
    else:
        print(f"❌ Confirm validation failed: {confirm_serializer.errors}")
except Exception as e:
    print(f"❌ Error during confirm: {e}")
    import traceback
    traceback.print_exc()

# 4. Cleanup
user.delete()
print(f"\n✅ Test user deleted")
print("\n🎉 Full password reset flow test complete!")

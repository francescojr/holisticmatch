"""
Script to clean up orphaned User records and release emails
Run this when a user email is stuck as "already registered" after deletion

Usage:
    python manage.py shell
    >>> exec(open('cleanup_users.py').read())
    >>> cleanup_email('email@example.com')
    >>> cleanup_all_orphaned_users()
"""

from django.contrib.auth.models import User
from professionals.models import Professional

def cleanup_email(email: str):
    """
    Delete user account by email and release the email for reuse
    
    Args:
        email: Email address to clean up
    """
    try:
        user = User.objects.get(email=email)
        
        # Check if user has associated professional profile
        professional = Professional.objects.filter(user=user).first()
        
        if professional:
            print(f"🗑️ Deleting Professional: {professional.id} ({professional.name})")
            professional.delete()
        
        print(f"🗑️ Deleting User: {email}")
        user.delete()
        
        print(f"✅ Email '{email}' is now available for reuse")
        return True
        
    except User.DoesNotExist:
        print(f"❌ User with email '{email}' not found")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


def cleanup_all_orphaned_users():
    """
    Find and delete all User accounts without Professional profile
    These are orphaned accounts that block email reuse
    """
    # Find users without professional profile
    orphaned_users = User.objects.exclude(professional__isnull=False)
    
    if not orphaned_users.exists():
        print("✅ No orphaned users found")
        return 0
    
    count = orphaned_users.count()
    print(f"⚠️ Found {count} orphaned user(s):")
    
    for user in orphaned_users:
        print(f"   - {user.email} (created: {user.date_joined})")
    
    # Ask for confirmation
    confirm = input(f"\n🔴 Delete these {count} users? (yes/no): ")
    
    if confirm.lower() == 'yes':
        for user in orphaned_users:
            email = user.email
            user.delete()
            print(f"   ✅ Deleted {email}")
        
        print(f"\n✅ Cleaned up {count} orphaned users")
        return count
    else:
        print("❌ Cancelled")
        return 0


def list_all_users():
    """
    List all users and their professional status
    """
    print("\n📋 All Users:\n")
    for user in User.objects.all().order_by('-date_joined'):
        professional = Professional.objects.filter(user=user).first()
        status = "✅ Has Profile" if professional else "❌ Orphaned"
        print(f"{user.email:40} | {status}")


# Run cleanup
if __name__ == '__main__':
    print("🔧 User Cleanup Script\n")
    print("Available functions:")
    print("  - cleanup_email('email@example.com')  # Clean specific email")
    print("  - cleanup_all_orphaned_users()         # Clean all orphaned accounts")
    print("  - list_all_users()                     # List all users\n")

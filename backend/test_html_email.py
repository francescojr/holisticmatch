#!/usr/bin/env python
"""
Test email sending with HTML
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.mail import send_mail, EmailMessage

# Test 1: Using send_mail with html_message
print("\nTest 1: send_mail with html_message parameter")
print("="*50)

html_content = """<html>
<head><style>body { color: #10b981; }</style></head>
<body>
<h1>Test Email</h1>
<p>This is a test HTML email</p>
</body>
</html>"""

try:
    result = send_mail(
        subject='Test Email - HTML',
        message='',  # Plain text fallback
        html_message=html_content,
        from_email='noreply@test.com',
        recipient_list=['test@example.com'],
        fail_silently=False
    )
    print(f"✅ send_mail returned: {result}")
except Exception as e:
    print(f"❌ send_mail failed: {e}")
    print(f"Error type: {type(e).__name__}")

# Test 2: Using EmailMessage directly
print("\nTest 2: EmailMessage with content_subtype='html'")
print("="*50)

try:
    msg = EmailMessage(
        subject='Test Email - HTML Direct',
        body=html_content,
        from_email='noreply@test.com',
        to=['test@example.com']
    )
    msg.content_subtype = 'html'  # This makes it HTML
    result = msg.send(fail_silently=False)
    print(f"✅ EmailMessage.send() returned: {result}")
except Exception as e:
    print(f"❌ EmailMessage.send() failed: {e}")
    print(f"Error type: {type(e).__name__}")

print("\n" + "="*50)
print("Django send_mail with html_message should work with Resend backend")
print("The backend receives the email and uses message.body which contains the HTML")

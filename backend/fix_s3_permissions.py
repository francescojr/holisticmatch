#!/usr/bin/env python
"""
Script to fix S3 object permissions for existing images.
Makes all photos in the photos/ folder publicly readable.
"""
import os
import boto3
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

def fix_s3_permissions():
    """Fix permissions for existing S3 objects"""
    if not settings.USE_S3:
        print("S3 not enabled, skipping...")
        return

    # Create S3 client
    s3_client = boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME
    )

    bucket_name = settings.AWS_STORAGE_BUCKET_NAME

    # Known image files (from check_s3.py output)
    image_files = [
        'cara.png', 'churros.png', 'moderna.jpg', 'placeholder.png',
        'tia01.png', 'yog.jpg', 'ypgi.png'
    ]

    count = 0
    for filename in image_files:
        print(f"Fixing permissions for: {filename}")

        try:
            # Update ACL to public-read
            s3_client.put_object_acl(
                Bucket=bucket_name,
                Key=filename,
                ACL='public-read'
            )
            count += 1
            print("  ✅ Success")
        except Exception as e:
            print(f"  ❌ Error: {str(e)}")

    print(f"\n✅ Fixed permissions for {count} images")

    # Test one image
    if image_files:
        test_key = image_files[0]
        test_url = f"https://{bucket_name}.s3.amazonaws.com/{test_key}"
        print(f"\n🧪 Testing: {test_url}")

        import requests
        try:
            response = requests.get(test_url, timeout=10)
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                print("✅ Image is now publicly accessible!")
            else:
                print(f"❌ Still not accessible: {response.text[:200]}")
        except Exception as e:
            print(f"❌ Error testing: {str(e)}")

if __name__ == '__main__':
    fix_s3_permissions()
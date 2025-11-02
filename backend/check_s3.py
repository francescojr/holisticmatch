#!/usr/bin/env python
"""
Check S3 bucket contents
"""
import os
import boto3
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

def check_s3_contents():
    """Check what's in the S3 bucket"""
    s3 = boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME
    )

    bucket_name = settings.AWS_STORAGE_BUCKET_NAME
    print(f"Bucket: {bucket_name}")
    print(f"Region: {settings.AWS_S3_REGION_NAME}")

    try:
        response = s3.list_objects_v2(Bucket=bucket_name)

        if 'Contents' in response:
            print(f"Found {len(response['Contents'])} objects:")
            for obj in response['Contents']:
                print(f"  - {obj['Key']} ({obj['Size']} bytes)")
        else:
            print("No objects found in bucket")

    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == '__main__':
    check_s3_contents()
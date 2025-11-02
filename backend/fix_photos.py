#!/usr/bin/env python
"""
Script to fix photo field values in the database.
Converts full URLs to just filenames.
"""
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from professionals.models import Professional

def fix_photo_fields():
    """Fix photo field values to contain only filenames"""
    count = 0
    for professional in Professional.objects.exclude(photo__isnull=True).exclude(photo=''):
        original_name = professional.photo.name
        if 'https://' in original_name or 'http://' in original_name:
            # Extract filename from URL
            filename = os.path.basename(original_name.split('?')[0])  # Remove query params
            professional.photo.name = filename
            professional.save()
            count += 1
            print(f"Fixed: {original_name} -> {filename}")

    print(f"\n✓ Fixed {count} professionals")

if __name__ == '__main__':
    fix_photo_fields()
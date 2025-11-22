#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from professionals.models import Professional
from professionals.serializers import ProfessionalSummarySerializer

# Check what the API is actually returning
professionals = Professional.objects.select_related('user').all()
print(f"Total professionals (unfiltered): {professionals.count()}")

# Apply filter like get_queryset does
active = professionals.filter(user__is_active=True)
print(f"Active professionals (is_active=True): {active.count()}")

# Serialize them
serializer = ProfessionalSummarySerializer(active, many=True)
print(f"Serialized count: {len(serializer.data)}")
print()

# Show each professional
for i, p in enumerate(serializer.data[:5]):
    print(f"[{i}] {p.get('name')} - is_active: {p.get('is_active')}")

print()
print(f"All is_active values: {set([p.get('is_active') for p in serializer.data])}")

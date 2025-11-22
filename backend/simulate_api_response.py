#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from professionals.models import Professional
from professionals.serializers import ProfessionalSummarySerializer
from rest_framework.pagination import LimitOffsetPagination

print("=" * 80)
print("SIMULATING API /professionals/ ENDPOINT")
print("=" * 80)
print()

# Step 1: Get queryset (what get_queryset() returns)
print("[1] Calling get_queryset()...")
all_professionals = Professional.objects.select_related('user').all()
print(f"  Total in DB: {all_professionals.count()}")

active_professionals = all_professionals.filter(user__is_active=True)
print(f"  Active (is_active=True): {active_professionals.count()}")

inactive = all_professionals.filter(user__is_active=False)
print(f"  Inactive (is_active=False): {inactive.count()}")
if inactive:
    print(f"  Inactive names: {list(inactive.values_list('name', flat=True))}")
print()

# Step 2: Apply pagination (API has PAGE_SIZE=12)
print("[2] Applying pagination (PAGE_SIZE=12)...")
paginator = LimitOffsetPagination()
paginator.page_size = 12
paginated_qs = paginator.paginate_queryset(active_professionals, None)
print(f"  Paginated count: {len(paginated_qs) if paginated_qs else 0}")
print()

# Step 3: Serialize
print("[3] Serializing results...")
if paginated_qs:
    serializer = ProfessionalSummarySerializer(paginated_qs, many=True)
    print(f"  Serialized count: {len(serializer.data)}")
    print()
    
    print("[4] Response data:")
    response_data = {
        'count': active_professionals.count(),
        'results': serializer.data
    }
    
    print(f"  Count: {response_data['count']}")
    print(f"  Results: {len(response_data['results'])}")
    print()
    
    print("  First 3 professionals:")
    for i, prof in enumerate(response_data['results'][:3]):
        print(f"    [{i}] {prof.get('name')} (ID: {prof.get('id')}) - is_active: {prof.get('is_active')}")
    
    print()
    all_is_active = set([p.get('is_active') for p in response_data['results']])
    print(f"  All is_active values: {all_is_active}")
    
    print()
    print("  First result keys:")
    print(f"    {list(response_data['results'][0].keys())}")

#!/usr/bin/env python
"""
Test script to verify professional queryset filtering
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from professionals.models import Professional
from django.contrib.auth.models import User

# Todos os profissionais
all_profs = Professional.objects.select_related('user').all()
print(f"Total professionals: {all_profs.count()}")

# Apenas ativos (is_active=True)
active_profs = all_profs.filter(user__is_active=True)
print(f"Active professionals (is_active=True): {active_profs.count()}")

# Apenas inativos
inactive_profs = all_profs.filter(user__is_active=False)
print(f"Inactive professionals (is_active=False): {inactive_profs.count()}")

print("\n❌ Inactive professionals (should NOT appear in API):")
for p in inactive_profs.values('id', 'name', 'user__is_active'):
    print(f"  - {p['name']} (ID: {p['id']}, user_is_active: {p['user__is_active']})")

print("\n✅ Active professionals (should appear in API):")
for p in active_profs.values('id', 'name', 'user__is_active'):
    print(f"  - {p['name']} (ID: {p['id']}, user_is_active: {p['user__is_active']})")

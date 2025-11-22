import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from professionals.models import Professional
from professionals.serializers import ProfessionalSummarySerializer
import json

profs = Professional.objects.select_related('user').all()[:5]

for prof in profs:
    ser = ProfessionalSummarySerializer(prof)
    is_active_val = ser.data.get('is_active')
    print(f'{prof.name}: is_active={is_active_val} (tipo: {type(is_active_val).__name__})')

print('\nJSON dump of first professional:')
if profs:
    ser = ProfessionalSummarySerializer(profs[0])
    print(json.dumps(ser.data, indent=2, default=str))

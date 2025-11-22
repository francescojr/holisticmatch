#!/bin/bash
cd /home/django/holisticmatch/backend
source venv/bin/activate
python3 << 'EOF'
import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from professionals.serializers import ProfessionalSummarySerializer
print("✅ Serializer loaded successfully")
s = ProfessionalSummarySerializer()
print("Fields:", list(s.fields.keys()))
EOF

#!/bin/bash
cd /home/django/holisticmatch/backend
source venv/bin/activate
python3 << 'EOF'
import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
c = Client()
response = c.get('/api/v1/professionals/?limit=1')
print(f"Status: {response.status_code}")
if response.status_code != 200:
    print(f"Content: {response.content[:500]}")
else:
    import json
    data = json.loads(response.content)
    prof = data['results'][0] if data['results'] else {}
    print(json.dumps(prof, indent=2))
EOF

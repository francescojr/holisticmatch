#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
import json

client = Client()
response = client.get('/api/v1/professionals/')
print('Status:', response.status_code)

if response.status_code == 200:
    data = json.loads(response.content)
    print('Count:', data.get('count'))
    print('Results length:', len(data.get('results', [])))
    
    if data.get('results'):
        print('\nFirst 3 professionals:')
        for i, prof in enumerate(data['results'][:3]):
            name = prof.get('name')
            is_active = prof.get('is_active')
            print(f'  [{i}] {name} - is_active: {is_active}')
        
        print('\nAll is_active values:', set([p.get('is_active') for p in data['results']]))
else:
    print('Error:', response.text[:200])

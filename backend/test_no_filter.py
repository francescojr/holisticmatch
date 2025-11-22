import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from professionals.models import Professional

# Simula: Se get_queryset RETORNASSE TODOS (sem filtro)
all_profs = Professional.objects.select_related('user').all()
print(f'Total professionals (sem filtro): {all_profs.count()}')

# Pega os primeiros 12 (pagination)
page_1 = all_profs[:12]
print(f'\nPrimeiros 12 (page 1 com PAGE_SIZE=12):')
for prof in page_1:
    print(f'  {prof.name} - user.is_active: {prof.user.is_active}')

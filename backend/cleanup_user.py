"""
Script para limpar um usuário do banco de dados, deletando corretamente as dependências.

Uso: python manage.py shell < cleanup_user.py
ou:  python manage.py shell
     exec(open('cleanup_user.py').read())
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from professionals.models import Professional

# CONFIGURAR AQUI: email do usuário que você quer deletar
EMAIL_TO_DELETE = 'seu_email@example.com'

print(f"\n🔍 Procurando usuário com email: {EMAIL_TO_DELETE}")

try:
    user = User.objects.get(email=EMAIL_TO_DELETE)
    print(f"✅ Usuário encontrado: {user.email} (ID: {user.id})")
    
    # Checar se tem Professional profile
    try:
        professional = Professional.objects.get(user=user)
        print(f"✅ Professional profile encontrado: {professional.name} (ID: {professional.id})")
        print(f"📧 Email do Professional: {professional.email}")
        print(f"🏙️ Cidade: {professional.city}, {professional.state}")
        
        # Deletar Professional (isso deveria deletar User também por CASCADE)
        print(f"\n🗑️  Deletando Professional...")
        professional.delete()
        print(f"✅ Professional deletado com sucesso")
        
    except Professional.DoesNotExist:
        print(f"⚠️  Nenhum Professional profile encontrado para este usuário")
        print(f"Deletando apenas o User...")
    
    # Verificar se User foi deletado (CASCADE)
    try:
        user.refresh_from_db()
        print(f"⚠️  User ainda existe após deletar Professional!")
        print(f"Tentando deletar User diretamente...")
        user.delete()
        print(f"✅ User deletado com sucesso")
    except User.DoesNotExist:
        print(f"✅ User foi deletado automaticamente (CASCADE funcionou)")
    
    print(f"\n✅ Limpeza concluída com sucesso!")
    
except User.DoesNotExist:
    print(f"❌ Usuário com email {EMAIL_TO_DELETE} não encontrado no banco")
    print(f"\n📋 Usuários cadastrados:")
    for u in User.objects.all():
        print(f"  - {u.email} (ID: {u.id}, is_active: {u.is_active})")

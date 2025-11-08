"""
Script para debugar e forçar envio de email de verificação

Uso: python manage.py shell < debug_email_send.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from professionals.models import Professional, EmailVerificationToken
import logging
import uuid
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger('professionals')

print("\n" + "="*80)
print("[DEBUG] EMAIL SENDING - DATAJACK13@GMAIL.COM")
print("="*80 + "\n")

# ============================================================================
# PASSO 1: Encontrar o usuário
# ============================================================================

email_target = 'datajack13@gmail.com'
print(f"[SEARCH] Procurando usuario: {email_target}")

user = User.objects.filter(email=email_target).first()

if not user:
    print(f"❌ User não encontrado com email: {email_target}")
    print("\n📋 Usuários disponíveis:")
    for u in User.objects.all():
        print(f"  - {u.email} (ID: {u.id}, is_active: {u.is_active})")
    exit(1)

print(f"✅ User encontrado:")
print(f"   ID: {user.id}")
print(f"   Email: {user.email}")
print(f"   Username: {user.username}")
print(f"   is_active: {user.is_active}")

# ============================================================================
# PASSO 2: Verificar se tem token de verificação existente
# ============================================================================

print(f"\n🔍 Procurando token de verificação existente...")

try:
    token_obj = EmailVerificationToken.objects.get(user=user)
    print(f"✅ Token encontrado:")
    print(f"   ID: {token_obj.id}")
    print(f"   Token: {token_obj.token[:30]}...")
    print(f"   Criado em: {token_obj.created_at}")
    print(f"   Expira em: {token_obj.expires_at}")
    print(f"   Verificado: {token_obj.is_verified}")
    token = token_obj.token
except EmailVerificationToken.DoesNotExist:
    print(f"⚠️  Nenhum token encontrado")
    print(f"🔄 Criando novo token...")
    token_value = str(uuid.uuid4())
    token_obj = EmailVerificationToken.objects.create(
        user=user,
        token=token_value,
        expires_at=timezone.now() + timedelta(hours=24)
    )
    token = token_value
    print(f"✅ Token criado: {token[:30]}...")

# ============================================================================
# PASSO 3: Verificar Professional Profile
# ============================================================================

print(f"\n🔍 Procurando Professional profile...")

try:
    professional = Professional.objects.get(user=user)
    print(f"✅ Professional encontrado:")
    print(f"   ID: {professional.id}")
    print(f"   Nome: {professional.name}")
    print(f"   Email: {professional.email}")
    print(f"   Cidade: {professional.city}, {professional.state}")
except Professional.DoesNotExist:
    print(f"❌ Professional não encontrado para este usuário")

# ============================================================================
# PASSO 4: Verificar configuração de EMAIL
# ============================================================================

print(f"\n📧 Configuração de EMAIL:")
print(f"   EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
print(f"   DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
print(f"   RESEND_API_KEY: {'✅ SET' if settings.RESEND_API_KEY else '❌ NOT SET'}")

if settings.RESEND_API_KEY:
    print(f"   API Key (primeiros chars): {settings.RESEND_API_KEY[:10]}...")

# ============================================================================
# PASSO 5: Tentar enviar o email
# ============================================================================

print(f"\n📤 Tentando enviar email de verificação...")

try:
    verification_link = f"https://holisticmatch.vercel.app/verify-email?token={token}"
    
    message = f"""
    Olá {user.username},
    
    Bem-vindo ao HolisticMatch!
    
    Clique no link abaixo para verificar seu email:
    {verification_link}
    
    Se você não se registrou, ignore este email.
    
    Abraços,
    Time HolisticMatch
    """
    
    result = send_mail(
        subject='Verifique seu email - HolisticMatch',
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )
    
    print(f"✅ Email enviado com sucesso!")
    print(f"   Destinatário: {user.email}")
    print(f"   De: {settings.DEFAULT_FROM_EMAIL}")
    print(f"   Assunto: Verifique seu email - HolisticMatch")
    print(f"   Token: {token[:40]}...")
    print(f"   Link: {verification_link}")
    
except Exception as e:
    print(f"❌ Erro ao enviar email:")
    print(f"   Tipo: {type(e).__name__}")
    print(f"   Mensagem: {str(e)}")
    logger.error(f"❌ Erro ao enviar email de verificação: {e}", exc_info=True)

# ============================================================================
# PASSO 6: Verificação final
# ============================================================================

print(f"\n✅ DEBUG COMPLETO")
print("="*80 + "\n")

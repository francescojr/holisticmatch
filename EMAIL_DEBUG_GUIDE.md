# 🐛 Email Delivery Debug Guide

## Status Atual

✅ Email backend configurado: `resend.django.EmailBackend`  
❌ Email não está sendo entregue durante o registro

---

## 🔍 Problemas Identificados

### 1. **API Key Exposta (CORRIGIDO ✅)**
- **Problema**: API key foi commitada em documentação
- **Solução**: Removida de todos os arquivos públicos
- **Localização Segura**: GitHub Secrets apenas

### 2. **from_email Hardcoded (CORRIGIDO ✅)**
- **Problema**: Usava `from_email='noreply@holisticmatch.com'` em vez de `settings.DEFAULT_FROM_EMAIL`
- **Solução**: Alterado para usar `settings.DEFAULT_FROM_EMAIL`
- **Resultado**: Respeita configuração de ambiente

### 3. **Falta de Logging (CORRIGIDO ✅)**
- **Problema**: Não havia visibilidade do que estava acontecendo
- **Solução**: Adicionado logging detalhado em todos os passos
- **Localização**: `backend/logs/django.log`

---

## 🚀 Como Debugar Email Localmente

### 1. **Verificar Configuração**

```bash
cd backend

# Verifique que o Resend está instalado
pip show resend

# Cheque se as variáveis estão setadas
python manage.py shell
>>> from django.conf import settings
>>> print(f"Email Backend: {settings.EMAIL_BACKEND}")
>>> print(f"Default From Email: {settings.DEFAULT_FROM_EMAIL}")
>>> print(f"RESEND_API_KEY: {'SET' if settings.RESEND_API_KEY else 'NOT SET'}")
```

### 2. **Executar Registro com Logs**

```bash
# Terminal 1: Rodar Django com logs visíveis
cd backend
python manage.py runserver --verbosity=2

# Terminal 2: Fazer registro via cURL ou Postman
curl -X POST http://localhost:8000/api/v1/professionals/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "full_name": "Test User",
    "bio": "Testing email delivery",
    "service_type": ["meditation"],
    "city": "São Paulo",
    "state": "SP"
  }'
```

### 3. **Verificar Logs**

```bash
# Ver logs em tempo real
tail -f backend/logs/django.log

# Procurar por erros de email
grep -i "email" backend/logs/django.log
grep -i "resend" backend/logs/django.log
grep -i "❌" backend/logs/django.log
```

---

## 📊 Logs de Email - O Que Procurar

### ✅ Sucesso esperado:
```
INFO ... 🔄 Starting professional registration for email: test@example.com
INFO ... ✅ User created: test@example.com (is_active=False)
INFO ... ✅ Professional profile created for test@example.com
INFO ... ✅ Email verification token created: xxxxx...
INFO ... 📧 Email Backend: resend.django.EmailBackend
INFO ... 📧 From Email: onboarding@resend.dev
INFO ... 📧 Recipient: test@example.com
INFO ... 📤 Attempting to send verification email...
INFO ... ✅ Verification email sent successfully to test@example.com
```

### ❌ Possíveis erros:

```
ERROR ❌ Failed to send verification email to test@example.com
ERROR Error type: AuthenticationError
ERROR Error message: Invalid authentication credentials
→ Significa: RESEND_API_KEY não está configurada corretamente
```

```
ERROR ❌ Failed to send verification email to test@example.com
ERROR Error type: RequestException
ERROR Error message: Connection timeout
→ Significa: Problema de rede ou servidor Resend indisponível
```

```
WARNING ⚠️ RESEND_API_KEY not in settings
→ Significa: Variável de ambiente não foi lida
```

---

## 🔧 Checklist para Validar Setup

```
[ ] 1. Resend API Key adicionado ao .env
      cat backend/.env | grep RESEND_API_KEY

[ ] 2. Django consegue ler a chave
      python manage.py shell → settings.RESEND_API_KEY

[ ] 3. Resend package instalado
      pip show resend

[ ] 4. Logging está ativo
      ls -la backend/logs/

[ ] 5. Serializer usa settings.DEFAULT_FROM_EMAIL
      grep -n "from_email" backend/professionals/serializers.py

[ ] 6. Teste local funciona
      python manage.py runserver + registro HTTP
```

---

## 🧪 Teste Rápido de Email

```bash
cd backend

python manage.py shell
```

```python
from django.core.mail import send_mail
from django.conf import settings

# Teste básico
send_mail(
    subject='Test - HolisticMatch',
    message='Se você vê isso, email está funcionando!',
    from_email=settings.DEFAULT_FROM_EMAIL,
    recipient_list=['seu_email@example.com'],
)

print("Email enviado!")
```

---

## 🚨 Se Email Ainda Não Funcionar

### 1. **Verifique GitHub Secrets**
```bash
# GitHub Secrets devem ter RESEND_API_KEY
https://github.com/francescojr/holisticmatch/settings/secrets/actions
```

### 2. **Verifique AWS EB Environment**
```bash
# Se em produção, cheque EB
eb printenv | grep RESEND_API_KEY
```

### 3. **Teste Resend API Key Diretamente**
```python
import resend

# Tente se conectar ao Resend
try:
    result = resend.Emails.send({
        "from": "onboarding@resend.dev",
        "to": "seu_email@example.com",
        "subject": "Test Email",
        "html": "<h1>Test</h1>"
    })
    print(f"✅ Email enviado! ID: {result.get('id')}")
except Exception as e:
    print(f"❌ Erro ao enviar: {e}")
```

---

## 📝 Logging Configuration

**Localização**: `backend/config/settings.py`

**Níveis de Log**:
- `DEBUG`: Informações detalhadas (desenvolvimento)
- `INFO`: Informações gerais (eventos importantes)
- `WARNING`: Alertas (potencial problema)
- `ERROR`: Erros (algo não funcionou)
- `CRITICAL`: Erro crítico (sistema quebrou)

**Módulos com DEBUG ativado**:
- `professionals` - Registro, email, autenticação
- `authentication` - Fluxo de login

---

## 🎯 Próximas Ações

1. **Executar registro localmente** → Verificar logs
2. **Buscar por "❌" ou "ERROR"** nos logs
3. **Identificar exatamente onde falha** (API key? Rede? Configuração?)
4. **Corrigir conforme erro**
5. **Testar novamente**

---

**Data**: 2025-11-08  
**Status**: Em Debugging  
**Última Atualização**: Logging adicionado e API key removida de arquivos públicos

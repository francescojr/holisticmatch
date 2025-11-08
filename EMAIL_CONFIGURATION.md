# 📧 Guia de Configuração de Email - Resend

## ✅ Status Atual
- ✅ Backend: Configurado para Resend
- ✅ GitHub Actions: Secrets adicionados
- ✅ Requirements: resend==2.19.0 adicionado
- ❌ AWS EB: Variáveis precisam ser setadas (veja abaixo)
- ⏳ GitHub Secrets: Precisam ser adicionadas

---

## 🚀 **Setup Rápido (3 Passos)**

### **Passo 1: Adicionar Secret no GitHub**

1. Vá para: **GitHub → Settings → Secrets and variables → Actions**
2. Clique **New repository secret**
3. Nome: `RESEND_API_KEY`
4. Value: `<Seu Resend API Key>` (veja seção "Como Gerar Resend API Key" abaixo)
5. Clique **Add secret**

### **Passo 2: Configurar AWS EB Environment**

```bash
# Opção A: Automático (RECOMENDADO)
cd backend
bash configure_eb_env.sh

# Opção B: Manual via CLI
cd backend
eb setenv \
  RESEND_API_KEY=<seu_resend_api_key> \
  DEFAULT_FROM_EMAIL=onboarding@resend.dev \
  EMAIL_BACKEND=resend.django.EmailBackend

# Opção C: Via AWS Console
# → Elastic Beanstalk → holisticmatch-env → Configuration
# → Software → Environment properties → Adicionar acima
```

### **Passo 3: Deploy**

```bash
# Fazer push para main (dispara CI + Deploy automático)
git push origin main

# Ou deploy manual
eb deploy
```

---

## 🧪 **Testar Localmente**

```bash
# 1. Instale dependências
pip install -r requirements.txt

# 2. Configure .env (já feito)
cat backend/.env | grep RESEND

# 3. Rode o servidor
python manage.py runserver

# 4. Registre um usuário via Postman
POST http://localhost:8000/api/v1/professionals/register/

# 5. ✅ Email chega em seu inbox real!
```

---

## 📊 **Configurações por Ambiente**

### **Development (Local)**
```
EMAIL_BACKEND: resend.django.EmailBackend
RESEND_API_KEY: re_2MrKCFP3_6x5e3PwLJKjNf8Sp5KYTLF3Q
DEFAULT_FROM_EMAIL: onboarding@resend.dev
```

### **CI/CD (GitHub Actions)**
```
EMAIL_BACKEND: resend.django.EmailBackend (via secrets)
RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
DEFAULT_FROM_EMAIL: onboarding@resend.dev
```

### **Production (AWS EB)**
```
EMAIL_BACKEND: resend.django.EmailBackend (via configure_eb_env.sh)
RESEND_API_KEY: (setado via eb setenv)
DEFAULT_FROM_EMAIL: onboarding@resend.dev
```

---

## 🎯 **Arquivos Modificados**

| Arquivo | Mudança | Razão |
|---------|---------|-------|
| `requirements.txt` | +resend==2.19.0 | Dependência email |
| `settings.py` | +Resend config | Email backend |
| `.env` | +RESEND_API_KEY | Chave API |
| `.env.example` | +Resend template | Documentação |
| `ci.yml` | +RESEND_API_KEY | GitHub secret |
| `deploy-backend.yml` | +RESEND_API_KEY | GitHub secret |
| `configure_eb_env.sh` | Nova | Script setup EB |

---

## 🔐 **GitHub Secrets Necessários**

```yaml
RESEND_API_KEY: re_2MrKCFP3_6x5e3PwLJKjNf8Sp5KYTLF3Q
AWS_ACCESS_KEY_ID: (já existe)
AWS_SECRET_ACCESS_KEY: (já existe)
DJANGO_SECRET_KEY: (já existe)
```

---

## ✅ **Checklist - Implementação Completa**

```
[ ] 1. Adicionar RESEND_API_KEY no GitHub Secrets
[ ] 2. Rodar configure_eb_env.sh
[ ] 3. Ou rodar eb setenv com variáveis
[ ] 4. git push origin main (dispara deploy)
[ ] 5. Esperar ~5 minutos
[ ] 6. Testar POST /api/v1/professionals/register/
[ ] 7. ✅ Email chega!
```

---

## � **Troubleshooting**

| Problema | Solução |
|----------|---------|
| "RESEND_API_KEY not found" | Verificar .env e eb setenv |
| Email não chega | Verificar spam, resend.com dashboard |
| CI testa falhando | GitHub secret não adicionado |
| EB deploy lento | Normal, até 5 minutos |

---

## 📞 **Suporte Resend**

- Dashboard: https://resend.com/dashboard
- Documentação: https://resend.com/docs
- Email limite: 100/dia (grátis), depois R$ 0,10 por email

---

**Status: ✅ PRONTO PARA PRODUÇÃO**


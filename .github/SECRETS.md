# 🔐 GitHub Secrets Configuration Guide

Este arquivo explica como configurar os **GitHub Secrets** necessários para o CI/CD funcionar.

---

## 📋 Secrets Necessários

Acesse: **GitHub Repository** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### 1️⃣ Backend (AWS Elastic Beanstalk)

| Secret Name | Descrição | Como Obter |
|-------------|-----------|------------|
| `AWS_ACCESS_KEY_ID` | AWS Access Key | IAM User → Security credentials → Create access key |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Key | Mesmo local do Access Key (aparece só uma vez!) |
| `DJANGO_SECRET_KEY` | Django Secret Key | Gere: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `DATABASE_URL` | Supabase Connection String | Supabase Dashboard → Settings → Database → Connection string (URI) |

**Exemplo DATABASE_URL**:
```
postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

### 2️⃣ Frontend (Vercel)

| Secret Name | Descrição | Como Obter |
|-------------|-----------|------------|
| `VERCEL_TOKEN` | Vercel API Token | Vercel Dashboard → Settings → Tokens → Create Token |
| `VERCEL_ORG_ID` | Vercel Organization ID | Vercel CLI: `vercel whoami` ou no .vercel/project.json após primeiro deploy |
| `VERCEL_PROJECT_ID` | Vercel Project ID | Vercel CLI: `vercel project ls` ou no .vercel/project.json |
| `VITE_API_BASE_URL` | Backend URL | URL do Elastic Beanstalk (ex: `http://holisticmatch-env.sa-east-1.elasticbeanstalk.com`) |

---

## 🚀 Obter Vercel Secrets (Passo a Passo)

### Método 1: Via Vercel Dashboard (Recomendado)

1. **VERCEL_TOKEN**:
   - Acesse https://vercel.com/account/tokens
   - Clique em **Create Token**
   - Scope: `Full Account`
   - Expiration: `No Expiration` (ou 1 year)
   - Copie o token (aparece só uma vez!)

2. **VERCEL_ORG_ID** e **VERCEL_PROJECT_ID**:
   - Primeiro deploy manual via Vercel Dashboard
   - Vá em **Project Settings** → **General**
   - Role até **Project ID** e copie
   - Para ORG_ID, veja na URL: `vercel.com/[ORG_ID]/[PROJECT_NAME]`

### Método 2: Via Vercel CLI

```powershell
# Instale Vercel CLI
npm install -g vercel

# Login
vercel login

# No diretório frontend/
cd frontend
vercel link

# Vercel vai criar .vercel/project.json com os IDs
# Veja os IDs:
Get-Content .vercel/project.json | ConvertFrom-Json

# Copie:
# - orgId → VERCEL_ORG_ID
# - projectId → VERCEL_PROJECT_ID
```

---

## 🔒 AWS IAM User Setup (Para CI/CD)

1. **Acesse IAM Console**: https://console.aws.amazon.com/iam/

2. **Create User**:
   - User name: `github-actions-ci`
   - Access type: **Programmatic access**

3. **Attach Policies**:
   - `AWSElasticBeanstalkFullAccess`
   - `AmazonS3FullAccess`

4. **Create Access Key**:
   - Security credentials → Create access key
   - Use case: **Third-party service**
   - **ANOTE**: Access Key ID e Secret Access Key (aparece só uma vez!)

---

## ✅ Checklist Final

Antes de fazer `git push`, verifique:

- [ ] Todos os 8 secrets configurados no GitHub
- [ ] AWS EB environment criado (`eb create holisticmatch-env`)
- [ ] Vercel project criado (pode ser manual ou via CLI)
- [ ] Backend testando localmente (10/10 tests passing)
- [ ] Frontend buildando sem erros (`npm run build`)

---

## 🧪 Testar CI/CD

```powershell
# 1. Commit e push
git add .
git commit -m "feat: add CI/CD with GitHub Actions"
git push origin main

# 2. Acompanhar no GitHub
# https://github.com/francescojr/holisticmatch/actions

# 3. Ver logs em tempo real
# Clique na action → deploy-backend ou deploy-frontend
```

---

## 🔄 Workflow Automático

```mermaid
graph LR
    A[git push main] --> B{Detecta mudanças}
    B -->|backend/** alterado| C[Run Tests]
    B -->|frontend/** alterado| D[Build Frontend]
    C --> E[Deploy AWS EB]
    D --> F[Deploy Vercel]
    E --> G[✅ Backend Live]
    F --> H[✅ Frontend Live]
```

**Como funciona**:
1. Você faz `git push origin main`
2. GitHub Actions detecta se mudou `backend/` ou `frontend/`
3. Roda testes (backend) ou build (frontend)
4. Deploy automático no AWS EB ou Vercel
5. Notificação de sucesso/erro

**Tempo total**: 5-10 minutos por deploy

---

## 🐛 Troubleshooting

### "AWS credentials not found"
- Verifique se `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY` estão corretos
- IAM User tem permissões `AWSElasticBeanstalkFullAccess`

### "Vercel deployment failed"
- Verifique `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- Token tem scope `Full Account`
- Project existe no Vercel

### "Tests failed"
- Backend: veja logs no GitHub Actions → deploy-backend → Run tests
- Fix local primeiro, depois push novamente

### "Database connection error"
- Verifique `DATABASE_URL` secret
- Teste conexão local: `python manage.py migrate`
- Supabase database está rodando

---

## 📚 Recursos

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vercel CLI Docs](https://vercel.com/docs/cli)
- [AWS EB CLI Docs](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3.html)
- [Elastic Beanstalk Deploy Action](https://github.com/einaregilsson/beanstalk-deploy)

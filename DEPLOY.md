# 🚀 Guia de Deploy - HolisticMatch

## ⚡ TL;DR - Deploy Automático CI/CD

**Depois de configurar uma vez, basta:**

```powershell
git add .
git commit -m "feat: minha feature"
git push origin main
```

✅ GitHub Actions vai:
1. Rodar testes do backend
2. Buildar frontend
3. Deploy automático no AWS EB (backend)
4. Deploy automático no Vercel (frontend)

**Tempo total**: 5-10 minutos

📖 **Setup CI/CD**: Veja [.github/SECRETS.md](.github/SECRETS.md) para configurar os secrets

---

## 🏗️ Arquitetura de Produção

```
┌──────────────┐
│   Usuários   │
└──────┬───────┘
       │
       ├────────────────────────────────┐
       │                                │
       ▼                                ▼
┌──────────────┐                ┌──────────────┐
│   VERCEL     │                │   AWS EB     │
│  (Frontend)  │◄───────────────┤  (Backend)   │
│  React + TS  │   GitHub       │  Django DRF  │
│              │   Actions      │              │
└──────────────┘   CI/CD        └──────┬───────┘
                                       │
                        ┌──────────────┼──────────────┐
                        │              │              │
                        ▼              ▼              ▼
                 ┌─────────────┐ ┌─────────┐ ┌──────────┐
                 │  SUPABASE   │ │ AWS S3  │ │  GitHub  │
                 │ PostgreSQL  │ │ (Fotos) │ │ Actions  │
                 └─────────────┘ └─────────┘ └──────────┘
```

**Custo Estimado**: $0-20/mês
- Vercel: Gratuito (Hobby)
- AWS EB: ~$10-15/mês (t3.micro EC2)
- Supabase: Gratuito (500MB DB + 2GB bandwidth)
- AWS S3: ~$0.023/GB/mês
- GitHub Actions: Gratuito (2000 min/mês)

---

## 🎯 Duas Formas de Deploy

### 1️⃣ **CI/CD Automático (RECOMENDADO)** ⚡

**Configuração única** → Deploy automático a cada `git push`

- ✅ Zero comandos manuais
- ✅ Testes automáticos antes do deploy
- ✅ Rollback fácil (git revert + push)
- ✅ Deploy paralelo (backend + frontend ao mesmo tempo)
- ✅ Histórico completo no GitHub Actions

**Setup**: Siga `.github/SECRETS.md` (10 minutos)

### 2️⃣ **Deploy Manual** 🔧

**Execução de comandos** → `eb deploy` e `vercel deploy`

- Para quem prefere controle total
- Útil para debugging
- Mais lento (comandos separados)

**Setup**: Siga este guia completo abaixo

---

## 📋 Pré-requisitos

Antes de começar, crie contas em:

- [ ] **GitHub** (código-fonte)
- [ ] **Vercel** (frontend) - https://vercel.com
- [ ] **AWS** (backend + storage) - https://aws.amazon.com
- [ ] **Supabase** (database) - https://supabase.com

Ferramentas necessárias:
- Git
- AWS CLI (`pip install awsebcli`)
- Node.js 18+
- Python 3.11+

---

## 1️⃣ **SUPABASE (Database PostgreSQL)**

### Passo 1: Criar Projeto
1. Acesse https://supabase.com/dashboard
2. Clique em **New Project**
3. Configure:
   - **Organization**: Crie uma nova ou use existente
   - **Name**: `holisticmatch`
   - **Database Password**: (use senha forte, anote!)
   - **Region**: `South America (São Paulo)` (sa-east-1)
   - **Pricing Plan**: `Free` (500MB DB + 2GB bandwidth)

### Passo 2: Obter Credenciais
1. Vá em **Settings** → **Database**
2. Role até **Connection string** → **URI**
3. Copie a connection string no formato:
```
postgresql://postgres.PROJECT_REF:YOUR_PASSWORD@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

4. Anote também:
   - **Host**: `db.PROJECT_REF.supabase.co`
   - **Port**: `5432`
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: (sua senha)

### Passo 3: Testar Conexão Local
```powershell
# No backend/, crie .env com:
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-sa-east-1.pooler.supabase.com:5432/postgres

# Teste a conexão:
cd backend
python manage.py migrate
python manage.py seed_professionals
```

✅ Se as migrations rodarem sem erro, o banco está configurado!

---

## 2️⃣ **AWS S3 (Storage de Fotos)**

### Passo 1: Criar Bucket
1. Acesse https://s3.console.aws.amazon.com
2. Clique em **Create bucket**
3. Configure:
   - **Bucket name**: `holisticmatch-media` (nome único global)
   - **AWS Region**: `sa-east-1` (São Paulo)
   - **Block Public Access**: ❌ DESMARQUE todas as opções (fotos públicas)
   - **Bucket Versioning**: Disabled
   - **Tags**: (opcional)
   - **Default encryption**: Enable (SSE-S3)

### Passo 2: Configurar Permissões
1. Vá no bucket → **Permissions** → **Bucket policy**
2. Adicione esta policy (substitua `holisticmatch-media`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::holisticmatch-media/*"
    }
  ]
}
```

### Passo 3: Configurar CORS
1. Vá em **Permissions** → **Cross-origin resource sharing (CORS)**
2. Cole:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### Passo 4: Criar IAM User
1. Acesse https://console.aws.amazon.com/iam/
2. **Users** → **Add users**
3. **User name**: `holisticmatch-s3-user`
4. **Permissions**: Attach policies directly → `AmazonS3FullAccess`
5. **Create user**
6. Clique no usuário → **Security credentials** → **Create access key**
7. Escolha **Application running outside AWS**
8. **Anote**:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

---

## 3️⃣ **AWS ELASTIC BEANSTALK (Deploy Backend)**

### Por que Elastic Beanstalk?
- ✅ Infraestrutura AWS profissional (EC2, Load Balancer, Auto Scaling)
- ✅ Suporte nativo Python/Django
- ✅ Fácil gerenciamento de ambiente
- ✅ Melhor que Railway para escala

### Passo 1: Instalar EB CLI
```powershell
pip install awsebcli
```

### Passo 2: Configurar AWS Credentials
```powershell
aws configure
# AWS Access Key ID: (seu access key ID)
# AWS Secret Access Key: (seu secret key)
# Default region name: sa-east-1
# Default output format: json
```

### Passo 3: Inicializar EB
```powershell
cd backend

# Inicializa o aplicativo EB
eb init -p python-3.11 holisticmatch --region sa-east-1
```

### Passo 4: Criar requirements.txt para produção
```powershell
# Combine requirements.txt com requirements-prod.txt
Get-Content requirements.txt, requirements-prod.txt | Set-Content requirements-full.txt
```

### Passo 5: Criar Ambiente e Deploy
```powershell
# Cria ambiente e faz deploy
eb create holisticmatch-env --single --instance-type t3.micro

# Aguarde 5-10 minutos para provisionar recursos
```

### Passo 6: Configurar Variáveis de Ambiente
```powershell
eb setenv `
  DJANGO_SECRET_KEY="sua-secret-key-aqui" `
  DJANGO_DEBUG="False" `
  DJANGO_ALLOWED_HOSTS=".elasticbeanstalk.com,.vercel.app" `
  DATABASE_URL="postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres" `
  AWS_ACCESS_KEY_ID="seu-access-key" `
  AWS_SECRET_ACCESS_KEY="seu-secret-key" `
  AWS_STORAGE_BUCKET_NAME="holisticmatch-media" `
  AWS_S3_REGION_NAME="us-east-2" `
  USE_S3="True" `
  CORS_ALLOWED_ORIGINS="https://holisticmatch.vercel.app"
```

### Passo 7: Rodar Migrations
```powershell
# Conecte via SSH e rode migrations
eb ssh

# Dentro do servidor:
cd /var/app/current
source /var/app/venv/*/bin/activate
python manage.py migrate
python manage.py seed_professionals
exit
```

### Passo 8: Obter URL
```powershell
eb status
# Anote a CNAME: holisticmatch-env.sa-east-1.elasticbeanstalk.com
```

✅ Backend rodando em: `http://holisticmatch-env.sa-east-1.elasticbeanstalk.com`

---

## 4️⃣ **VERCEL (Deploy Frontend)**

### Passo 1: Push para GitHub
```powershell
cd E:\datajack\holisticmatch
git init
git add .
git commit -m "feat: MVP completo - backend + frontend"
git branch -M main
git remote add origin https://github.com/seu-usuario/holisticmatch.git
git push -u origin main
```

### Passo 2: Importar no Vercel
1. Acesse https://vercel.com
2. **Login com GitHub**
3. **Add New** → **Project**
4. **Import** o repositório `holisticmatch`
5. **Configure o projeto**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Passo 3: Configurar Variável de Ambiente
1. **Environment Variables** → Adicione:
```bash
VITE_API_BASE_URL=http://holisticmatch-env.sa-east-1.elasticbeanstalk.com
```

2. Clique em **Deploy**

### Passo 4: Aguardar Deploy
- Vercel vai instalar dependências, buildar e deployar (2-3 minutos)
- Anote a URL: `https://holisticmatch.vercel.app`

✅ Frontend rodando em: `https://holisticmatch.vercel.app`

---

## 5️⃣ **CONFIGURAÇÃO FINAL (CORS)**

### Atualizar ALLOWED_HOSTS e CORS no Backend

No Elastic Beanstalk, adicione a URL do Vercel:

```powershell
eb setenv CORS_ALLOWED_ORIGINS="https://holisticmatch.vercel.app"
```

### Verificar se tudo está funcionando

1. Acesse `https://holisticmatch.vercel.app`
2. Teste busca e filtros
3. Abra um perfil profissional
4. Teste botões de contato

---

## 🔄 **DEPLOYS FUTUROS**

### Backend (Elastic Beanstalk)
```powershell
cd backend
git add .
git commit -m "feat: nova funcionalidade"
git push
eb deploy
```

### Frontend (Vercel)
```powershell
cd frontend
git add .
git commit -m "feat: nova funcionalidade"
git push
# Vercel deploya automaticamente!
```

---

## 💰 **CUSTOS ESTIMADOS**

| Serviço | Plano | Custo/mês |
|---------|-------|-----------|
| **Vercel** | Hobby | $0 (100GB bandwidth) |
| **AWS EB** | t3.micro EC2 | $8-12 (750h free tier 1º ano) |
| **Supabase** | Free | $0 (500MB DB + 2GB bandwidth) |
| **AWS S3** | Standard | ~$0.023/GB + $0.005/1k requests |
| **TOTAL** | | **$8-15/mês** (após free tier) |

---

## 🐛 **TROUBLESHOOTING**

### Backend não conecta no Supabase
```powershell
# Verifique a connection string
eb printenv | Select-String DATABASE_URL

# Teste conexão local primeiro
cd backend
python manage.py migrate
```

### Frontend não chama backend
1. Verifique `VITE_API_BASE_URL` no Vercel
2. Verifique CORS no backend (`CORS_ALLOWED_ORIGINS`)
3. Abra DevTools → Network → veja as requisições

### EB Deploy falha
```powershell
# Veja os logs
eb logs

# Redeploy forçado
eb deploy --staged
```

### S3 fotos não aparecem
1. Verifique Bucket Policy (pública)
2. Verifique CORS no bucket
3. Teste URL direta: `https://holisticmatch-media.s3.sa-east-1.amazonaws.com/professionals/test.jpg`

---

## 📚 **RECURSOS**

- [AWS Elastic Beanstalk Docs](https://docs.aws.amazon.com/elasticbeanstalk/)
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Django on EB](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create-deploy-python-django.html)

---

## ✅ **CHECKLIST FINAL**

- [ ] GitHub: código commitado
- [ ] Supabase: database criado e migrado
- [ ] S3: bucket criado, policy configurada
- [ ] EB: backend deployed e rodando
- [ ] EB: variáveis de ambiente configuradas
- [ ] EB: migrations executadas
- [ ] Vercel: frontend deployed
- [ ] Vercel: VITE_API_BASE_URL configurada
- [ ] CORS: backend aceita frontend
- [ ] Teste: abrir site e criar busca
- [ ] Teste: abrir perfil profissional
- [ ] Teste: botões WhatsApp/Email/Phone

---

🎉 **PARABÉNS! Seu MVP está no ar com infraestrutura profissional AWS!**

6. **Deploy!**

7. **Anote a URL**: Algo como `https://holisticmatch.vercel.app`

---

## 6️⃣ **CONFIGURAÇÕES FINAIS**

### A. Atualizar CORS no Backend

No Railway, adicione a URL do Vercel nas variáveis:
```bash
CORS_ALLOWED_ORIGINS=https://holisticmatch.vercel.app
ALLOWED_HOSTS=*.railway.app,holisticmatch.vercel.app
```

### B. Testar a API

```bash
# Teste se a API está rodando:
https://sua-url-railway.railway.app/api/v1/professionals/
```

### C. Testar o Frontend

```bash
# Abra no navegador:
https://holisticmatch.vercel.app
```

---

## 🔄 **CI/CD: DEPLOY AUTOMÁTICO COM GITHUB ACTIONS**

### 🎯 O Que Você Ganha

Ao invés de:
```powershell
# Backend
cd backend
eb deploy

# Frontend  
cd frontend
vercel deploy --prod
```

Você faz apenas:
```powershell
git push origin main
```

E o GitHub Actions faz tudo automaticamente! 🚀

### 📦 Workflows Configurados

Já criamos 4 workflows para você:

#### 1. **deploy-backend.yml** - Deploy Backend Automático
- **Trigger**: Push em `main` que altere `backend/**`
- **Ações**:
  1. ✅ Roda testes (pytest)
  2. 📦 Deploy no AWS Elastic Beanstalk
  3. ⏱️ Aguarda ambiente ficar healthy
  4. 🎉 Notifica sucesso/erro

#### 2. **deploy-frontend.yml** - Deploy Frontend Automático
- **Trigger**: Push em `main` que altere `frontend/**`
- **Ações**:
  1. 📦 Instala dependências (npm ci)
  2. 🏗️ Build (npm run build)
  3. 🚀 Deploy no Vercel
  4. 🎉 Notifica sucesso/erro

#### 3. **ci.yml** - Testes em Pull Requests
- **Trigger**: Pull Request para `main` ou `develop`
- **Ações**:
  1. ✅ Roda testes backend com coverage
  2. 🔍 Linter (Ruff) no backend
  3. 📝 TypeScript check no frontend
  4. 🏗️ Build do frontend
  5. 📊 Upload coverage para Codecov

#### 4. **database-migrate.yml** - Migrations Manuais
- **Trigger**: Manual (workflow_dispatch)
- **Ações**:
  1. 🗄️ Rodar `migrate`, `makemigrations` ou `seed_professionals`
  2. Direto no Supabase via DATABASE_URL

### 🔐 Setup dos Secrets (UMA VEZ SÓ)

Siga o guia completo: **[.github/SECRETS.md](.github/SECRETS.md)**

**Resumo rápido**:

1. **GitHub Repository** → **Settings** → **Secrets and variables** → **Actions**

2. Adicione 8 secrets:

| Secret | O que é |
|--------|---------|
| `AWS_ACCESS_KEY_ID` | AWS IAM User access key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM User secret key |
| `DJANGO_SECRET_KEY` | Django secret (gere com `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`) |
| `DATABASE_URL` | Supabase connection string |
| `VERCEL_TOKEN` | Vercel API token (vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `VITE_API_BASE_URL` | Backend URL (AWS EB URL) |

### 🚀 Usando o CI/CD

#### Deploy Normal (Tudo Automático)

```powershell
# 1. Faça suas mudanças
# Edite backend/ ou frontend/

# 2. Commit e push
git add .
git commit -m "feat: nova funcionalidade incrível"
git push origin main

# 3. Acompanhe no GitHub
# Vá em: https://github.com/francescojr/holisticmatch/actions
# Veja os workflows rodando em tempo real!
```

#### Deploy Seletivo

Se você alterar **apenas o backend**:
- ✅ Workflow `deploy-backend` roda
- ⏭️ Workflow `deploy-frontend` **não roda** (economiza tempo!)

Se você alterar **apenas o frontend**:
- ✅ Workflow `deploy-frontend` roda
- ⏭️ Workflow `deploy-backend` **não roda**

Se alterar **ambos**:
- ✅ Ambos workflows rodam **em paralelo** (mais rápido!)

#### Rodar Migrations no Supabase

```powershell
# No GitHub:
# Actions → Database Migration → Run workflow
# Escolha: migrate, makemigrations, ou seed_professionals
```

### 📊 Acompanhar Deploy

1. **GitHub Actions**: https://github.com/francescojr/holisticmatch/actions
   - Veja logs em tempo real
   - Status de cada step
   - Tempo de execução

2. **AWS EB Console**: https://sa-east-1.console.aws.amazon.com/elasticbeanstalk
   - Veja eventos do deploy
   - Health do ambiente
   - Logs da aplicação

3. **Vercel Dashboard**: https://vercel.com/dashboard
   - Veja builds
   - Logs do deployment
   - Analytics

### 🐛 Rollback (Se Algo Der Errado)

```powershell
# Voltar para commit anterior
git revert HEAD
git push origin main

# GitHub Actions vai deployar a versão anterior automaticamente!
```

### ⚡ Comparação: Manual vs CI/CD

| Aspecto | Manual | CI/CD |
|---------|--------|-------|
| **Comandos** | `cd backend; eb deploy` + `cd frontend; vercel deploy` | `git push` |
| **Tempo** | 5-10 min (sequencial) | 5-7 min (paralelo) |
| **Testes** | Você precisa rodar | Automático antes do deploy |
| **Erros** | Deploy mesmo com testes falhando | Bloqueia deploy se falhar |
| **Rollback** | `eb deploy` commit antigo | `git revert` + push |
| **Histórico** | Logs locais | GitHub Actions (completo) |
| **Setup** | Toda vez que trocar de máquina | Uma vez (secrets) |

### 🎓 Entendendo os Workflows

**Estrutura típica**:
```yaml
on:
  push:
    branches: [main]
    paths: ['backend/**']  # Só roda se backend/ mudar

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4  # Clone do repo
      - uses: actions/setup-python@v4  # Instala Python
      - run: pytest  # Roda testes
      - uses: einaregilsson/beanstalk-deploy@v21  # Deploy EB
        with:
          aws_access_key: ${{ secrets.AWS_ACCESS_KEY_ID }}
```

**Secrets são injetados** via `${{ secrets.NOME }}`

---

## 🎯 **RESUMO DO FLUXO**

### Setup Inicial (Uma Vez)

1. **Supabase** → Criar database PostgreSQL
2. **AWS S3** → Criar bucket para fotos
3. **AWS EB** → Criar ambiente (`eb create holisticmatch-env`)
4. **Vercel** → Criar project (manual ou CLI)
5. **GitHub Secrets** → Configurar 8 secrets ([.github/SECRETS.md](.github/SECRETS.md))
6. **Push** → `git push origin main`

### Desenvolvimento Diário (Com CI/CD)

1. **Code** → Faz suas alterações
2. **Test** → `pytest` (backend) ou `npm run build` (frontend)
3. **Commit** → `git commit -m "feat: xyz"`
4. **Push** → `git push origin main`
5. **☕ Espera** → 5-7 minutos (GitHub Actions faz tudo)
6. **✅ Live** → Backend + Frontend atualizados!

---

## 🆘 **TROUBLESHOOTING**

### Erro de CORS
- Adicione a URL do Vercel em `CORS_ALLOWED_ORIGINS`
- Adicione em `ALLOWED_HOSTS`

### Erro 502/503 no Railway
- Verifique os logs: `railway logs`
- Confirme que `DATABASE_URL` está configurada
- Confirme que migrations rodaram

### Frontend não conecta na API
- Verifique se `VITE_API_BASE_URL` está correta
- Teste a API diretamente no navegador
- Verifique o console do navegador (F12)

---

## 💰 **CUSTOS**

### Free Tier (Grátis):
- ✅ **Supabase**: 500MB database, 1GB file storage
- ✅ **Railway**: $5 crédito mensal (suficiente para MVP)
- ✅ **Vercel**: 100GB bandwidth, deployments ilimitados

### Total: **$0/mês** inicialmente!

---

## 🔄 **DEPLOYS FUTUROS**

Com tudo configurado, deploys futuros são automáticos:

```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

- Railway e Vercel detectam o push e fazem deploy automaticamente!

---

## 📝 **PRÓXIMOS PASSOS OPCIONAIS**

1. Configurar domínio customizado (holisticmatch.com)
2. Configurar AWS S3 para fotos de perfil
3. Adicionar monitoramento (Sentry)
4. Configurar backup automático do banco
5. Implementar CI/CD com GitHub Actions

---

**Qualquer dúvida, me avise!** 🚀

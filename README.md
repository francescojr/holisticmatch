# 🌿 HolisticMatch

> Marketplace para conectar pessoas a profissionais de terapias holísticas

[![Status](https://img.shields.io/badge/status-production%20live-success)]()
[![Frontend](https://img.shields.io/badge/frontend-vercel%20live-blue)](https://holisticmatch.vercel.app)
[![Backend](https://img.shields.io/badge/backend-elastic%20beanstalk-orange)](http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com)
[![Tests](https://img.shields.io/badge/tests-180%2F180%20passing-brightgreen)]()
[![Security](https://img.shields.io/badge/security-hardened-9cf)]()

---

## 🎉 Production Status - LIVE! 

✅ **Frontend**: https://holisticmatch.vercel.app/ (React 18 + Vite)  
✅ **Backend**: https://hollisticmatch.online/api/v1 (Django 4.2 on AWS EC2 t3.micro)  
✅ **Database**: Supabase PostgreSQL  
✅ **SSL/TLS**: Active on hollisticmatch.online (Let's Encrypt)  
✅ **API**: Full CRUD endpoints with filtering, pagination & content moderation  
✅ **Authentication**: JWT tokens + Email verification + Timing attack protection

### 🔐 Latest Updates (Nov 22, 2025 - 18:00 UTC)

#### 🎉 v1.0.8 - Auto-Login After Email Verification (NEW!)
- **Streamlined Onboarding**: Users now automatically login after email verification
- **One-Click Flow**: Verify email → Dashboard (no manual login needed!)
- **JWT Tokens**: Auto-generated upon successful email verification
- **Better UX**: Eliminates password re-entry friction

#### ✅ Technical Improvements
- **`na_contencao` Field Fixed**: Now always returns boolean (never `undefined`)
- **New Endpoint**: `GET /api/v1/professionals/verified/` - Returns only verified professionals
- **Independent Filtering**: `na_contencao` field no longer depends on `user.is_active`
- **Frontend Updated**: Auto-saves JWT tokens and redirects to dashboard
- **All 181 Tests Passing** ✅

#### 📊 Email Verification Flow (v1.0.8)
```
1. User registers → Email sent with verification link
2. User clicks link → Backend verifies token + generates JWT
3. Frontend saves tokens → Auto-login complete
4. Redirect to dashboard (user already authenticated) ✅
```

**No more manual login after verification!** 🚀

### 📸 Content Moderation Pipeline
- **Text**: OpenAI API (primary) → Regex fallback (Portuguese offensive words)
- **Photos**: AWS Rekognition (DetectModerationLabels + custom threshold)
- **Rekognition Policies**: ✅ Applied to `holisticmatch-s3-user` IAM user
- **Comprehend Policies**: ✅ Applied to `holisticmatch-s3-user` IAM user

---

## 🚀 Quick Start

### Acesso Rápido (Produção)
```
Frontend: https://holisticmatch.vercel.app
API Base: https://hollisticmatch.online/api/v1 (Primary - HTTPS)
API Backup: http://44.197.112.222/api/v1 (Secondary - HTTP)
```

### Desenvolvimento Local

```powershell
# Clone o repositório
git clone https://github.com/francescojr/holisticmatch.git
cd holisticmatch

# Backend (Terminal 1)
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_professionals
python manage.py runserver

# Frontend (Terminal 2)
cd frontend
npm install
npm run dev
```

Acesse:
- **Frontend**: http://localhost:5173
- **Backend API**: http://127.0.0.1:8000/api/v1/professionals/
- **Admin Django**: http://127.0.0.1:8000/admin/

---

## 🚀 Production Deployment

### Manual Deployment to AWS EC2

**⚠️ Critical Step After Each Code Deploy:**
```bash
# SSH to EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Navigate to backend
cd /path/to/holisticmatch/backend

# Pull latest code
git pull origin main

# Run migrations (MUST DO THIS!)
python manage.py migrate --verbosity=2

# Restart application
sudo systemctl restart gunicorn
```

**Why migrations are critical:**
- Each database schema change (new fields, indexes) requires a migration
- Without running migrations, new fields return `undefined` in API responses
- Example: v1.0.7 added `na_contencao` field - requires `python manage.py migrate`

**Full deployment guide:** See `DEPLOYMENT_MANUAL.md`

---

## 📚 Tech Stack

### Backend
- **Framework**: Django 4.2.7 + Django REST Framework 3.14.0
- **Database**: PostgreSQL (Supabase) / SQLite (dev)
- **Server**: Gunicorn + Nginx (AWS Elastic Beanstalk)
- **Testing**: pytest + pytest-django (180/180 tests passing ✅)
- **Linting**: ruff
- **Security**: JWT tokens, CSRF protection, secure cookies, timing attack protection

### Frontend
- **Framework**: React 18 + TypeScript 5.3 (strict mode)
- **Build**: Vite 5
- **Styling**: TailwindCSS 3.4 (mobile-first, dark mode)
- **Animations**: Framer Motion 11 (spring physics & custom easing)
- **State**: React Query + Axios
- **Deployment**: Vercel (auto-deploy on git push)
- **Session**: Real-time sync across browser tabs

### Infrastructure  
- **Backend**: AWS EC2 t3.micro (sa-east-1) with Gunicorn + Nginx
- **Frontend**: Vercel (auto-deploy on main branch)
- **Database**: Supabase PostgreSQL (sa-east-1)
- **Storage**: AWS S3 `holisticmatch-media` bucket (sa-east-1)
- **SSL/TLS**: Let's Encrypt (certbot, hollisticmatch.online)
- **Email**: Resend API (custom Django backend)
- **Moderation**: AWS Rekognition + OpenAI + Regex fallback

---

## ✨ Features (MVP)

### ✅ Implementado

- **Listagem de Profissionais**
  - Grid responsivo (1/2/3/4 colunas conforme tela)
  - Cards com foto, nome, serviços, localização, preço
  - Animações premium com spring physics (Framer Motion 11)

- **Filtros de Busca**
  - Tipo de serviço (12 opções: Reiki, Yoga, Acupuntura, etc.)
  - Cidade (busca parcial)
  - Tipo de atendimento (presencial, online, ambos)
  - Preço máximo

- **Modal de Detalhes**
  - Perfil completo do profissional
  - Bio, serviços, localização, preço
  - Botões de contato: WhatsApp, Email, Telefone

- **Backend API** ✅
  - `GET /api/v1/professionals/` - Listagem completa (todos profissionais)
  - `GET /api/v1/professionals/verified/` - **Recomendado**: Apenas verificados (na_contencao=True) ⭐
  - `GET /api/v1/professionals/{id}/` - Detalhes de um profissional
  - `GET /api/v1/professionals/service_types/` - Tipos de serviço disponíveis
  - `POST /api/v1/professionals/verify-email/` - Verificação de email com auto-login (v1.0.8)
  - Paginação (12 por página)
  - 181/181 tests passing ✅

- **Database** ✅
  - 12 profissionais de exemplo em 8 cidades brasileiras
  - Seeding automático: `python manage.py seed_professionals`

- **Deployment** ✅  
  - Frontend: Vercel (auto-deploy on push)
  - Backend: AWS Elastic Beanstalk (Gunicorn + Nginx)
  - Database: Supabase PostgreSQL

### 🎨 Recent Improvements (v1.0.1)

- **🔧 Bug Fixes**
  - Fixed service type filters (JSON array filtering in SQLite)
  - Corrected background colors to #f6f8f7 across all pages
  - Fixed missing logo symbols in login/register pages

- **✨ Animation Enhancements**
  - Upgraded to Framer Motion 11.x with spring physics
  - Custom cubic-bezier easing for smoother transitions
  - Enhanced animation durations (0.6-0.8s) and offsets
  - Added new animation variants for premium UX
  - Applied to all major pages: Dashboard, ProfessionalDetail, Login, Register

### 🔮 Roadmap (Futuro)

- [ ] Autenticação JWT (register, login, logout)
- [ ] Perfil de profissional (editar, foto upload S3)
- [ ] Sistema de avaliações (rating, comentários)
- [ ] Favoritos
- [ ] Agendamento
- [ ] Chat interno
- [ ] Pagamento (Stripe/Mercado Pago)
- [ ] Dashboard profissional

---

## 🚀 Deploy

### Automático (CI/CD) - RECOMENDADO

1. **Configure os secrets** (uma vez): [.github/SECRETS.md](.github/SECRETS.md)
2. **Push para main**:
   ```powershell
   git push origin main
   ```
3. **GitHub Actions faz tudo**: testes → build → deploy AWS EB + Vercel

**Tempo total**: 5-7 minutos

### Manual

Siga o guia completo: [DEPLOY.md](DEPLOY.md)

---

## 🧪 Testes

### Backend

```powershell
cd backend

# Rodar todos os testes
pytest

# Com coverage
pytest --cov=. --cov-report=html

# Linter
ruff check .
```

**Status**: ✅ 180/180 tests passing

### Frontend

```powershell
cd frontend

# TypeScript check
npx tsc --noEmit

# Linter
npm run lint

# Build
npm run build
```

---

## 📊 Database Schema

### Professional Model

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Primary key |
| `user` | OneToOne(User) | Relacionamento com User |
| `name` | CharField(100) | Nome completo |
| `bio` | TextField | Biografia |
| `services` | JSONField | Array de serviços |
| `city` | CharField(100) | Cidade |
| `state` | CharField(2) | Estado (UF) |
| `price_per_session` | DecimalField | Preço por sessão |
| `attendance_type` | CharField | presencial/online/ambos |
| `whatsapp` | CharField(20) | WhatsApp |
| `email` | EmailField | Email |
| `phone` | CharField(20) | Telefone |
| `photo` | ImageField | Foto de perfil (S3) |
| `na_contencao` | BooleanField | Email verificado (Default: False) - **v1.0.7+** |
| `created_at` | DateTimeField | Data de criação |
| `updated_at` | DateTimeField | Última atualização |

**Indexes**: `city`, `state`, `price_per_session`, `attendance_type`, `na_contencao`

**Email Verification Flow:**
1. Usuário se registra → `na_contencao = False`
2. Email de verificação enviado → EmailVerificationToken criado
3. Usuário clica link → `EmailVerificationToken.verify_token()` chamado
4. Na primeira verificação:
   - `User.is_active = True` (já existente)
   - `Professional.na_contencao = True` (novo em v1.0.7)
   - `EmailVerificationToken.is_verified = True`
5. ViewSet filtra por `user__is_active=True` (mantém compatibilidade backward)
6. Frontend recebe ambos `is_active` e `na_contencao` na API

---

## 🔐 Variáveis de Ambiente

### Backend (`.env`)

```bash
# Django
SECRET_KEY=sua-secret-key-aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (Supabase)
DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres

# AWS S3 (Produção)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=holisticmatch-media
AWS_S3_REGION_NAME=sa-east-1
USE_S3=False

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (`.env`)

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

## 📚 Documentação

- [DEPLOY.md](DEPLOY.md) - Guia completo de deploy (manual + CI/CD)
- [.github/SECRETS.md](.github/SECRETS.md) - Configuração de GitHub Secrets
- [specs.md](specs.md) - Especificações do projeto

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Commit suas mudanças: `git commit -m 'feat: minha feature'`
4. Push para a branch: `git push origin feature/minha-feature`
5. Abra um Pull Request

**CI vai rodar automaticamente**:
- ✅ Testes backend (pytest)
- ✅ Linter (ruff)
- ✅ TypeScript check
- ✅ Build frontend

---

## 👨‍💻 Autor

**Francesco Jr**
- GitHub: [@francescojr](https://github.com/francescojr)

---

**⭐ Se este projeto te ajudou, deixe uma estrela!**
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Copy environment variables
cp .env.example .env
# Edit .env with your database credentials

# Initialize Django project (run this once)
django-admin startproject config .

# Create Django apps
python manage.py startapp professionals
python manage.py startapp authentication
python manage.py startapp storage

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

Backend will be available at: **http://localhost:8000**

### Frontend Setup

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run development server
npm run dev
```

Frontend will be available at: **http://localhost:5173**

## 📖 Documentation

- **Feature Specification**: `specs/001-holistic-marketplace/spec.md`
- **Implementation Plan**: `specs/001-holistic-marketplace/plan.md`
- **Task Breakdown**: `specs/001-holistic-marketplace/tasks.md`
- **Data Model**: `specs/001-holistic-marketplace/data-model.md`
- **API Contracts**: `specs/001-holistic-marketplace/contracts/`
- **Developer Guide**: `specs/001-holistic-marketplace/quickstart.md`

## 🎯 MVP Scope (Phase 1-3)

The MVP focuses on **User Story 1: Client Search and Discovery**

**What's included:**
- Professional profile search and filtering (service type, location, price, attendance type)
- Professional profile detail view
- Direct contact mechanisms (WhatsApp, Email, Instagram)
- Mobile-responsive design
- Premium animations with Framer Motion 11 (spring physics & custom easing)
- Pagination (12 results per page)

**What's NOT included in MVP:**
- Professional registration (profiles created via Django admin)
- Professional profile editing
- User authentication
- Payment processing
- Reviews/ratings
- In-platform messaging

## 🧪 Testing

### Backend Tests
```powershell
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test types
pytest tests/contract/      # API contract tests
pytest tests/integration/   # Integration tests
pytest tests/unit/          # Unit tests
```

### Frontend Tests
```powershell
cd frontend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## 📝 Development Workflow

### Test-First Development (TDD) - MANDATORY

1. **Red**: Write a failing test
2. **Green**: Write minimal code to make it pass
3. **Refactor**: Improve code while keeping tests green

Example workflow:
```powershell
# 1. Write contract test for GET /api/v1/professionals/
cd backend/tests/contract
# Create test_professionals_api.py with failing test

# 2. Run test - should FAIL
pytest tests/contract/test_professionals_api.py -v

# 3. Implement Professional model, serializer, viewset
# (in professionals/models.py, serializers.py, views.py)

# 4. Run test again - should PASS
pytest tests/contract/test_professionals_api.py -v

# 5. Refactor and commit
git add .
git commit -m "feat(professionals): implement list endpoint with filters"
```

## 🛠️ Development Commands

### Backend
```powershell
# Type checking
mypy .

# Linting
ruff check .
ruff check --fix .  # Auto-fix

# Format
ruff format .

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Django shell
python manage.py shell
```

### Frontend
```powershell
# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix  # Auto-fix

# Format
npm run format

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📊 Project Status

- ✅ **Phase 1: Setup** - COMPLETE (Directory structure, configs, dependencies)
- ⏳ **Phase 2: Foundational** - NEXT (Django apps, S3 storage, JWT auth, API client)
- ⏳ **Phase 3: User Story 1** - PENDING (Professional search & discovery MVP)

## 🤝 Contributing

1. Follow TDD approach (tests before implementation)
2. All tasks are in `specs/001-holistic-marketplace/tasks.md`
3. Tasks marked [P] can be done in parallel
4. Follow the constitution principles in `.specify/memory/constitution.md`
5. Commit after each task or logical group

## 📞 Support

- Review `specs/001-holistic-marketplace/quickstart.md` for detailed setup
- Check API contracts in `specs/001-holistic-marketplace/contracts/`
- Refer to data model in `specs/001-holistic-marketplace/data-model.md`

---

**Next Steps**: Run `npm install` in frontend and `pip install -r requirements.txt` in backend, then proceed with Phase 2 tasks!

##  

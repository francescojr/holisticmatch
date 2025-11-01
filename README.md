# 🌿 HolisticMatch

> Marketplace para conectar pessoas a profissionais de terapias holísticas

[![Status](https://img.shields.io/badge/status-production%20live-success)]()
[![Frontend](https://img.shields.io/badge/frontend-vercel%20live-blue)](https://holisticmatch.vercel.app)
[![Backend](https://img.shields.io/badge/backend-elastic%20beanstalk-orange)](http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com)

---

## 🎉 Production Status - LIVE! 

✅ **Frontend**: https://holisticmatch.vercel.app/ (React 18 + Vite)  
✅ **Backend**: http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/ (Django 4.2)  
✅ **Database**: Supabase PostgreSQL (12 professionals loaded)  
✅ **API**: Full CRUD endpoints with filtering & pagination  

---

## 🚀 Quick Start

### Acesso Rápido (Produção)
```
Frontend: https://holisticmatch.vercel.app
API Base: http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1
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

## 📚 Tech Stack

### Backend
- **Framework**: Django 4.2.7 + Django REST Framework 3.14.0
- **Database**: PostgreSQL (Supabase) / SQLite (dev)
- **Server**: Gunicorn + Nginx (AWS Elastic Beanstalk)
- **Testing**: pytest + pytest-django (10/10 tests passing ✅)
- **Linting**: ruff

### Frontend
- **Framework**: React 18 + TypeScript 5.3 (strict mode)
- **Build**: Vite 5
- **Styling**: TailwindCSS 3.4 (mobile-first)
- **Animations**: Framer Motion 10
- **State**: React Query + Axios
- **Deployment**: Vercel (auto-deploy on git push)

### Infrastructure  
- **Backend**: AWS Elastic Beanstalk (t3.micro, us-east-2)
- **Frontend**: Vercel (auto-deploy)
- **Database**: Supabase PostgreSQL
- **Networking**: IPv6 enabled, Security Groups configured

---

## ✨ Features (MVP)

### ✅ Implementado

- **Listagem de Profissionais**
  - Grid responsivo (1/2/3/4 colunas conforme tela)
  - Cards com foto, nome, serviços, localização, preço
  - Animações suaves (Framer Motion)

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
  - `GET /api/v1/professionals/` - Listagem com filtros
  - `GET /api/v1/professionals/{id}/` - Detalhes
  - `GET /api/v1/professionals/service_types/` - Tipos de serviço
  - Paginação (12 por página)
  - 10/10 tests passing

- **Database** ✅
  - 12 profissionais de exemplo em 8 cidades brasileiras
  - Seeding automático: `python manage.py seed_professionals`

- **Deployment** ✅  
  - Frontend: Vercel (auto-deploy on push)
  - Backend: AWS Elastic Beanstalk (Gunicorn + Nginx)
  - Database: Supabase PostgreSQL


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

**Status**: ✅ 10/10 tests passing

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
| `created_at` | DateTimeField | Data de criação |
| `updated_at` | DateTimeField | Última atualização |

**Indexes**: `city`, `state`, `price_per_session`, `attendance_type`

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
- Smooth animations with Framer Motion
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

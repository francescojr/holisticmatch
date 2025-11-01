# HolisticMatch Developer Quickstart

This guide helps developers set up the HolisticMatch development environment and start contributing.

## Prerequisites

- **Python**: 3.11 or higher
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Git**: For version control
- **Supabase Account**: For PostgreSQL database (or local PostgreSQL 14+)
- **AWS Account**: For S3 storage (optional for local dev, can use local storage)

## Project Structure

```
holisticmatch/
├── backend/              # Django REST API
│   ├── config/          # Django settings
│   ├── professionals/   # Professionals app
│   ├── authentication/  # Auth app
│   ├── storage/         # File storage app
│   └── tests/           # Contract, integration, unit tests
├── frontend/            # React + TypeScript app
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   ├── services/    # API clients
│   │   ├── hooks/       # Custom React hooks
│   │   ├── types/       # TypeScript type definitions
│   │   └── lib/         # Utilities
│   └── tests/           # Integration and unit tests
└── specs/               # Feature specifications and plans
```

---

## Backend Setup (Django)

### 1. Navigate to Backend Directory

```powershell
cd backend
```

### 2. Create Python Virtual Environment

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 3. Install Dependencies

```powershell
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Development dependencies (pytest, mypy, etc.)
```

### 4. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Django Settings
SECRET_KEY=your-secret-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://user:password@db.xxxxx.supabase.co:5432/postgres

# AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_STORAGE_BUCKET_NAME=holisticmatch-photos
AWS_S3_REGION_NAME=us-east-1

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME=24  # hours
JWT_REFRESH_TOKEN_LIFETIME=168  # hours (7 days)

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### 5. Run Database Migrations

```powershell
python manage.py migrate
```

### 6. Create Superuser (Optional)

```powershell
python manage.py createsuperuser
```

### 7. Load Seed Data (Optional)

```powershell
python manage.py loaddata fixtures/service_types.json
python manage.py loaddata fixtures/sample_professionals.json
```

### 8. Start Development Server

```powershell
python manage.py runserver
```

Backend API will be available at: **http://localhost:8000**

API Documentation: **http://localhost:8000/api/v1/docs/**

---

## Frontend Setup (React + Vite)

### 1. Navigate to Frontend Directory

```powershell
cd frontend
```

### 2. Install Dependencies

```powershell
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_ENABLE_MOCK_API=false
```

### 4. Start Development Server

```powershell
npm run dev
```

Frontend will be available at: **http://localhost:5173**

---

## Running Tests

### Backend Tests (pytest)

```powershell
cd backend

# Run all tests
pytest

# Run with coverage report
pytest --cov=. --cov-report=html

# Run specific test types
pytest tests/contract/          # Contract tests
pytest tests/integration/       # Integration tests
pytest tests/unit/              # Unit tests

# Run specific test file
pytest tests/unit/test_professionals.py

# Run with verbose output
pytest -v

# Run and stop on first failure
pytest -x
```

Coverage report will be available at: `backend/htmlcov/index.html`

### Frontend Tests (vitest)

```powershell
cd frontend

# Run all tests
npm test

# Run in watch mode (auto-rerun on file changes)
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run specific test file
npm test src/components/ProfessionalCard.test.tsx

# Run in UI mode (interactive test viewer)
npm run test:ui
```

Coverage report will be available at: `frontend/coverage/index.html`

---

## Type Checking

### Backend (mypy)

```powershell
cd backend
mypy .
```

### Frontend (TypeScript)

```powershell
cd frontend
npm run type-check
```

---

## Linting and Formatting

### Backend (ruff)

```powershell
cd backend

# Lint code
ruff check .

# Auto-fix issues
ruff check --fix .

# Format code
ruff format .
```

### Frontend (ESLint + Prettier)

```powershell
cd frontend

# Lint code
npm run lint

# Auto-fix issues
npm run lint:fix

# Format code
npm run format
```

---

## Database Management

### Create New Migration

```powershell
cd backend
python manage.py makemigrations
```

### Apply Migrations

```powershell
python manage.py migrate
```

### Rollback Migration

```powershell
python manage.py migrate <app_name> <migration_number>
```

### Show Migration Status

```powershell
python manage.py showmigrations
```

### Create Database Backup (Supabase)

```powershell
# Using Supabase CLI
supabase db dump -f backup.sql
```

---

## Common Workflows

### Adding a New Django App

```powershell
cd backend
python manage.py startapp <app_name>
```

Then register the app in `config/settings.py`:

```python
INSTALLED_APPS = [
    # ...
    '<app_name>',
]
```

### Adding a New API Endpoint

1. Define model in `<app>/models.py`
2. Create serializer in `<app>/serializers.py`
3. Create view in `<app>/views.py`
4. Register URL in `<app>/urls.py`
5. Write contract test in `tests/contract/test_<app>.py`
6. Write integration test in `tests/integration/test_<app>.py`
7. Write unit tests in `tests/unit/test_<app>.py`

### Adding a New React Component

1. Create component file in `src/components/<ComponentName>.tsx`
2. Create test file `src/components/<ComponentName>.test.tsx`
3. Export from `src/components/index.ts`
4. Write unit tests following TDD approach

### Adding a New React Page

1. Create page in `src/pages/<PageName>.tsx`
2. Create test file `src/pages/<PageName>.test.tsx`
3. Register route in `src/App.tsx`
4. Write integration tests

---

## Debugging

### Backend Debug with VS Code

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Django Server",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/backend/manage.py",
      "args": ["runserver", "--noreload"],
      "django": true,
      "justMyCode": false
    }
  ]
}
```

### Frontend Debug with VS Code

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Chrome Debug",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/frontend/src"
    }
  ]
}
```

---

## Performance Profiling

### Backend API Performance

```powershell
cd backend

# Install django-silk
pip install django-silk

# Add to INSTALLED_APPS and run migrations
python manage.py migrate

# Access profiling UI at http://localhost:8000/silk/
```

### Frontend Bundle Analysis

```powershell
cd frontend

# Generate bundle analysis
npm run build -- --mode analyze

# Opens visualization in browser
```

---

## Troubleshooting

### Backend Issues

**Issue**: `ModuleNotFoundError: No module named '<module>'`
**Solution**: Ensure virtual environment is activated and dependencies installed:
```powershell
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Issue**: Database connection errors
**Solution**: Verify `.env` file has correct `DATABASE_URL` and database is accessible

**Issue**: S3 upload errors
**Solution**: Verify AWS credentials in `.env` and bucket exists with correct permissions

### Frontend Issues

**Issue**: `Cannot find module` errors
**Solution**: Delete `node_modules` and reinstall:
```powershell
rm -r node_modules
npm install
```

**Issue**: `CORS` errors when calling API
**Solution**: Verify `CORS_ALLOWED_ORIGINS` in backend `.env` includes frontend URL

**Issue**: Environment variables not loading
**Solution**: Restart Vite dev server after changing `.env` file

---

## Additional Resources

- **Django Documentation**: https://docs.djangoproject.com/en/4.2/
- **Django REST Framework**: https://www.django-rest-framework.org/
- **React Documentation**: https://react.dev/
- **Vite Documentation**: https://vitejs.dev/
- **TailwindCSS Documentation**: https://tailwindcss.com/docs
- **Framer Motion Documentation**: https://www.framer.com/motion/
- **Supabase Documentation**: https://supabase.com/docs
- **pytest Documentation**: https://docs.pytest.org/
- **vitest Documentation**: https://vitest.dev/

---

## Getting Help

- Check existing issues in the project repository
- Review the project constitution: `.specify/memory/constitution.md`
- Review feature specifications: `specs/001-holistic-marketplace/spec.md`
- Consult the technical research: `specs/001-holistic-marketplace/research.md`
- Ask questions in the team chat/Slack channel

---

## Next Steps

1. Run both backend and frontend servers
2. Open http://localhost:5173 in your browser
3. Explore the API documentation at http://localhost:8000/api/v1/docs/
4. Review the feature specification in `specs/001-holistic-marketplace/spec.md`
5. Pick a task from the project board and start coding!

**Remember**: Follow Test-First Development (TDD) as mandated by the project constitution. Write tests before implementation code.

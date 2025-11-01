# Implementation Plan: HolisticMatch Marketplace Platform

**Branch**: `001-holistic-marketplace` | **Date**: 2025-10-31 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-holistic-marketplace/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

---

## Implementation Plan Status

- ✅ **Phase 0 (Research)**: COMPLETE - [research.md](./research.md) created with technology decisions, API patterns, performance strategies, security practices, testing approach, monitoring plan, and risks/mitigations
- ✅ **Phase 1 (Design & Contracts)**: COMPLETE
  - [data-model.md](./data-model.md) created with database schema, entities, relationships, indexes, and query patterns
  - [contracts/auth-api.yaml](./contracts/auth-api.yaml) created with authentication API specification
  - [contracts/professionals-api.yaml](./contracts/professionals-api.yaml) created with professionals API specification
  - [quickstart.md](./quickstart.md) created with developer onboarding guide
  - Agent context updated via `update-agent-context.ps1`
- ⏳ **Phase 2 (Task Breakdown)**: PENDING - Run `/speckit.tasks` command to generate task breakdown

**Next Command**: `/speckit.tasks` - Generate granular task breakdown with test-first assignments

## Summary

Build a two-sided marketplace connecting holistic therapy clients with professionals through search, discovery, and direct contact. Core MVP features include professional profile management (registration, editing), advanced search/filtering (service type, location, price, attendance type), and contact mechanisms (WhatsApp, email, Instagram). Platform prioritizes mobile-responsive UX with smooth Framer Motion animations, sub-500ms API performance, and <200KB frontend bundle size. No payment processing or appointment booking in this phase—focus is on discovery and connection.

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript 5.0+ (frontend)  
**Primary Dependencies**: Django 4.2 + DRF, React 18, Vite 5, TailwindCSS 3.4, Framer Motion 10  
**Storage**: Supabase PostgreSQL (primary database with Row Level Security), AWS S3 (profile photo storage)  
**Testing**: pytest + pytest-django (backend), vitest + React Testing Library (frontend)  
**Target Platform**: Web (desktop + mobile browsers), deployed to AWS App Runner (backend) + Vercel (frontend)  
**Project Type**: Web application (separate backend/frontend)  
**Performance Goals**: API p95 < 500ms, frontend LCP < 2.5s, TTI < 3s on 3G, bundle < 200KB gzipped  
**Constraints**: Mobile-first (320px+ screens), WCAG 2.1 Level AA accessibility, Brazilian market (Portuguese, R$, +55 format)  
**Scale/Scope**: MVP targeting 100 concurrent users, 12 service types, ~1000 professional profiles initially

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with `.specify/memory/constitution.md`:

- [x] **Code Quality**: Type hints (Python) / TypeScript strict mode planned? → YES: Python type hints with mypy, TypeScript strict mode enabled
- [x] **Test-First**: TDD approach confirmed? Tests written before implementation? → YES: pytest + vitest with contract/integration/unit tests, TDD mandatory per constitution
- [x] **User Experience**: Mobile-responsive design? Framer Motion animations considered? → YES: Mobile-first (320px+), Framer Motion for stagger/transitions/hover effects
- [x] **Performance**: API response times < 500ms? Frontend bundle < 200KB? → YES: Explicit performance targets in spec (SC-003, SC-010)
- [x] **API Design**: REST conventions followed? Pagination/filtering planned? → YES: REST with `/api/v1/` versioning, pagination (12/page), multi-filter support
- [x] **Architecture**: Using Supabase PostgreSQL, AWS S3, proper secrets management? → YES: Supabase for DB, S3 for photos, AWS Secrets Manager for production credentials
- [x] **Simplicity**: YAGNI applied? No speculative features? Dependencies justified? → YES: Clear out-of-scope list (19 items), MVP-focused, standard Django/React ecosystem
- [x] **Security**: Input validation, HTTPS, rate limiting considered? → YES: Password policy (8+ chars), login lockout (5 attempts/15min), JWT auth, input sanitization

*If any gate fails, document justification in Complexity Tracking section.*

**Constitution Check Status**: ✅ **PASSED** - All gates satisfied

## Project Structure

### Documentation (this feature)

```text
specs/001-holistic-marketplace/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── auth-api.yaml
│   └── professionals-api.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── config/                 # Django project configuration
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── professionals/          # Main app
│   ├── models.py          # Professional, User models
│   ├── serializers.py     # DRF serializers
│   ├── views.py           # API viewsets
│   ├── filters.py         # Django Filter classes
│   ├── permissions.py     # Custom permissions
│   └── services.py        # Business logic layer
├── authentication/         # Auth app
│   ├── views.py           # Login, register, logout
│   └── serializers.py
├── storage/               # S3 integration
│   └── backends.py        # Custom storage backend
├── tests/
│   ├── contract/          # API contract tests
│   │   ├── test_auth_api.py
│   │   └── test_professionals_api.py
│   ├── integration/       # End-to-end flow tests
│   │   ├── test_registration_flow.py
│   │   └── test_search_flow.py
│   └── unit/              # Model/service unit tests
│       ├── test_models.py
│       └── test_services.py
├── requirements.txt
├── pytest.ini
└── Dockerfile

frontend/
├── src/
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── DashboardPage.tsx
│   ├── components/
│   │   ├── SearchFilters.tsx
│   │   ├── ProfessionalCard.tsx
│   │   ├── ProfessionalModal.tsx
│   │   ├── ContactButtons.tsx
│   │   └── forms/
│   │       ├── ProfessionalForm.tsx
│   │       └── AuthForm.tsx
│   ├── services/
│   │   ├── api.ts            # Axios instance
│   │   ├── authService.ts
│   │   └── professionalService.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useProfessionals.ts
│   │   └── useForm.ts
│   ├── types/
│   │   ├── Professional.ts
│   │   └── Auth.ts
│   ├── lib/
│   │   └── animations.ts     # Framer Motion variants
│   └── App.tsx
├── tests/
│   ├── integration/
│   │   ├── search.test.tsx
│   │   └── registration.test.tsx
│   └── unit/
│       ├── components/
│       └── services/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── vitest.config.ts
```

**Structure Decision**: Web application with separate backend/frontend repositories. Backend uses Django modular app structure (professionals, authentication, storage) to maintain separation of concerns. Frontend follows feature-based organization with pages, reusable components, and service layer for API communication. Testing mirrors source structure with contract/integration/unit separation as mandated by constitution.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All constitution gates passed without requiring complexity justification.

# Tasks: HolisticMatch Marketplace Platform

**Input**: Design documents from `/specs/001-holistic-marketplace/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Test tasks are MANDATORY per HolisticMatch constitution (Test-First Development).  
All features require tests written BEFORE implementation (Red-Green-Refactor cycle).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This project uses a web application structure with separate backend and frontend:
- **Backend**: `backend/` (Django REST API)
- **Frontend**: `frontend/` (React + TypeScript + Vite)
- **Tests**: `backend/tests/` (contract/integration/unit), `frontend/tests/` (integration/unit)

---

## Phase 1: Setup (Shared Infrastructure) ✅ COMPLETE

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend directory structure per plan.md: `backend/config/`, `backend/professionals/`, `backend/authentication/`, `backend/storage/`, `backend/tests/contract/`, `backend/tests/integration/`, `backend/tests/unit/`
- [x] T002 Create frontend directory structure per plan.md: `frontend/src/pages/`, `frontend/src/components/`, `frontend/src/services/`, `frontend/src/hooks/`, `frontend/src/types/`, `frontend/src/lib/`, `frontend/tests/integration/`, `frontend/tests/unit/`
- [x] T003 [P] Initialize Django project with dependencies in `backend/requirements.txt` (Django 4.2, DRF, dj-rest-auth, djangorestframework-simplejwt, django-cors-headers, psycopg2-binary, boto3, pillow, gunicorn, python-decouple)
- [x] T004 [P] Initialize Django dev dependencies in `backend/requirements-dev.txt` (pytest, pytest-django, pytest-cov, mypy, django-stubs, ruff)
- [x] T005 [P] Initialize React project with Vite in `frontend/package.json` with dependencies (react@18, react-dom@18, react-router-dom@6, axios, framer-motion@10, tailwindcss@3.4)
- [x] T006 [P] Initialize frontend dev dependencies in `frontend/package.json` (vite@5, @vitejs/plugin-react, typescript@5, vitest, @testing-library/react, @testing-library/jest-dom, eslint, prettier)
- [x] T007 [P] Configure Django settings in `backend/config/settings.py` with Supabase PostgreSQL connection, AWS S3 storage, JWT authentication, CORS, and environment variables (NOTE: Django project initialization pending - run `django-admin startproject config .` in backend/)
- [x] T008 [P] Configure TypeScript strict mode in `frontend/tsconfig.json`
- [x] T009 [P] Configure TailwindCSS in `frontend/tailwind.config.js` with mobile-first breakpoints
- [x] T010 [P] Configure pytest in `backend/pytest.ini` with coverage settings (80% target)
- [x] T011 [P] Configure vitest in `frontend/vitest.config.ts` with React Testing Library (70% target)
- [x] T012 [P] Configure ruff for linting in `backend/pyproject.toml`
- [x] T013 [P] Configure ESLint and Prettier in `frontend/.eslintrc.json` and `frontend/.prettierrc`
- [x] T014 [P] Setup environment variables template in `backend/.env.example` with DATABASE_URL, AWS credentials, JWT settings, CORS settings
- [x] T015 [P] Setup environment variables template in `frontend/.env.example` with VITE_API_BASE_URL

**Next Steps to Complete Phase 1:**
1. Install backend dependencies: `cd backend; python -m venv venv; .\venv\Scripts\Activate.ps1; pip install -r requirements.txt; pip install -r requirements-dev.txt`
2. Install frontend dependencies: `cd frontend; npm install`
3. Initialize Django project: `cd backend; django-admin startproject config .`
4. Copy environment files: `cp backend/.env.example backend/.env` and `cp frontend/.env.example frontend/.env`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T016 Create Django apps in backend: `python manage.py startapp professionals`, `python manage.py startapp authentication`, `python manage.py startapp storage`
- [ ] T017 [P] Configure Django URL routing in `backend/config/urls.py` with `/api/v1/` prefix and app includes
- [ ] T018 [P] Implement AWS S3 storage backend in `backend/storage/backends.py` with boto3 integration for photo uploads
- [ ] T019 [P] Create base API response middleware in `backend/config/middleware.py` for consistent error formatting
- [ ] T020 [P] Configure JWT authentication in `backend/config/settings.py` with 24-hour access token and 7-day refresh token
- [ ] T021 [P] Setup CORS configuration in `backend/config/settings.py` to allow frontend origin
- [ ] T022 [P] Create axios API client in `frontend/src/services/api.ts` with base URL, JWT interceptors, and error handling
- [ ] T023 [P] Create authentication context provider in `frontend/src/hooks/useAuth.ts` with login/logout/token refresh logic
- [ ] T024 [P] Create TypeScript types for Professional in `frontend/src/types/Professional.ts` matching data-model.md schema
- [ ] T025 [P] Create TypeScript types for Auth in `frontend/src/types/Auth.ts` with User, Tokens, LoginRequest, RegisterRequest
- [ ] T026 [P] Create Framer Motion animation variants in `frontend/src/lib/animations.ts` (stagger, fade-in, slide-up, hover, tap)
- [ ] T027 Setup Supabase PostgreSQL database connection and verify connectivity
- [ ] T028 Create initial Django migration for built-in User model: `python manage.py migrate`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Client Search and Discovery (Priority: P1) 🎯 MVP

**Goal**: Enable clients to discover holistic therapy professionals by filtering through services, location, and price range, then contact professionals directly via WhatsApp/email/Instagram.

**Independent Test**: Load homepage, enter search criteria (service type "Reiki", city "São Paulo", max price R$200), verify filtered results appear with contact buttons, click WhatsApp button and verify it opens WhatsApp application.

### Tests for User Story 1 (MANDATORY - TDD Required) ⚠️

> **CRITICAL: Write these tests FIRST, ensure they FAIL, then implement (Red-Green-Refactor)**

- [ ] T029 [P] [US1] Contract test for GET /api/v1/professionals/ with filters in `backend/tests/contract/test_professionals_api.py` (verify response schema matches contracts/professionals-api.yaml)
- [ ] T030 [P] [US1] Contract test for GET /api/v1/professionals/{id}/ in `backend/tests/contract/test_professionals_api.py` (verify detail response schema)
- [ ] T031 [P] [US1] Contract test for GET /api/v1/service-types/ in `backend/tests/contract/test_professionals_api.py` (verify service types list)
- [ ] T032 [P] [US1] Integration test for search flow in `backend/tests/integration/test_search_flow.py` (create professionals → filter by service → verify results)
- [ ] T033 [P] [US1] Integration test for pagination in `backend/tests/integration/test_search_flow.py` (create 15 professionals → verify 12 per page)
- [ ] T034 [P] [US1] Frontend integration test for search in `frontend/tests/integration/search.test.tsx` (render HomePage → fill filters → click search → verify cards render)
- [ ] T035 [P] [US1] Frontend integration test for professional detail modal in `frontend/tests/integration/search.test.tsx` (click card → verify modal opens with contact buttons)

### Implementation for User Story 1

#### Backend Implementation

- [ ] T036 [P] [US1] Create Professional model in `backend/professionals/models.py` with all fields per data-model.md (user FK, full_name, photo_url, bio, services JSONB, price_per_session, attendance_type, city, neighborhood, whatsapp, instagram, email, is_active, timestamps)
- [ ] T037 [US1] Create Professional model migration: `python manage.py makemigrations professionals`
- [ ] T038 [US1] Apply Professional migration: `python manage.py migrate professionals`
- [ ] T039 [P] [US1] Create indexes for Professional model in migration: composite (city, is_active), price_per_session, created_at, GIN on services
- [ ] T040 [P] [US1] Create Professional serializer in `backend/professionals/serializers.py` with validation (services list, price range 50-500, attendance_type enum, whatsapp format, bio max 500 chars)
- [ ] T041 [P] [US1] Create ProfessionalFilter class in `backend/professionals/filters.py` using django-filter for service, city, price_min, price_max, attendance_type
- [ ] T042 [US1] Implement ProfessionalViewSet in `backend/professionals/views.py` with list action (filtered, paginated 12/page, active only)
- [ ] T043 [US1] Implement retrieve action in ProfessionalViewSet for GET /api/v1/professionals/{id}/
- [ ] T044 [US1] Create service types constant in `backend/professionals/constants.py` with 12 therapy types list
- [ ] T045 [US1] Implement service-types endpoint in `backend/professionals/views.py` returning constants list
- [ ] T046 [US1] Register Professional URLs in `backend/professionals/urls.py` with router for viewset
- [ ] T047 [US1] Add logging for search queries in ProfessionalViewSet (log filters, result count, response time)

#### Frontend Implementation

- [ ] T048 [P] [US1] Create SearchFilters component in `frontend/src/components/SearchFilters.tsx` with dropdown (service), input (city), slider (price 50-500), checkbox (needs home)
- [ ] T049 [P] [US1] Create ProfessionalCard component in `frontend/src/components/ProfessionalCard.tsx` with photo, name, services, price, location, hover animations (scale 1.03)
- [ ] T050 [P] [US1] Create ProfessionalModal component in `frontend/src/components/ProfessionalModal.tsx` with full profile, contact buttons, AnimatePresence (scale 0.8→1.0)
- [ ] T051 [P] [US1] Create ContactButtons component in `frontend/src/components/ContactButtons.tsx` with WhatsApp link (wa.me format), email mailto, Instagram copy
- [ ] T052 [P] [US1] Create professionalService API client in `frontend/src/services/professionalService.ts` with getProfessionals(filters), getProfessionalById(id), getServiceTypes()
- [ ] T053 [P] [US1] Create useProfessionals hook in `frontend/src/hooks/useProfessionals.ts` with React Query for caching (5-min stale time)
- [ ] T054 [US1] Implement HomePage in `frontend/src/pages/HomePage.tsx` with SearchFilters, grid of ProfessionalCards, pagination controls
- [ ] T055 [US1] Add stagger animation to HomePage professional grid using Motion containerVariants (staggerChildren: 0.1)
- [ ] T056 [US1] Add fade-in + slide-up animation to ProfessionalCard using Motion itemVariants (opacity 0→1, y 20→0)
- [ ] T057 [US1] Add whileHover and whileTap animations to ContactButtons (hover 1.05x, tap 0.95x)
- [ ] T058 [US1] Implement pagination logic in HomePage with limit/offset query params
- [ ] T059 [US1] Create responsive layout for HomePage using TailwindCSS (1 col mobile, 2 col tablet, 3 col desktop)
- [ ] T060 [US1] Add error handling and loading states to HomePage with LoadingSpinner component

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Clients can search, filter, view professionals, and contact them. This is the complete MVP!

---

## Phase 4: User Story 2 - Professional Registration (Priority: P2)

**Goal**: Allow holistic therapy professionals to create accounts autonomously by providing credentials, profile information, services, pricing, and contact details to appear in the marketplace.

**Independent Test**: Access registration page, fill all required fields (email, password with 8+ chars + letter + number, name, upload photo <5MB, select services, set price R$150, choose attendance type, enter city/neighborhood, write bio, provide WhatsApp +5511999999999, Instagram handle), submit form, verify account created, JWT token returned, redirect to dashboard, professional appears in search results.

### Tests for User Story 2 (MANDATORY - TDD Required) ⚠️

- [ ] T061 [P] [US2] Contract test for POST /api/v1/auth/register/ in `backend/tests/contract/test_auth_api.py` (verify request/response schema matches contracts/auth-api.yaml)
- [ ] T062 [P] [US2] Contract test for password validation in `backend/tests/contract/test_auth_api.py` (8+ chars, letter + number)
- [ ] T063 [P] [US2] Contract test for duplicate email rejection in `backend/tests/contract/test_auth_api.py` (400 error with "Email já cadastrado")
- [ ] T064 [P] [US2] Integration test for registration flow in `backend/tests/integration/test_registration_flow.py` (register → verify user created → verify professional created → verify S3 photo uploaded)
- [ ] T065 [P] [US2] Integration test for email failure handling in `backend/tests/integration/test_registration_flow.py` (mock email failure → verify registration succeeds → verify retry queued)
- [ ] T066 [P] [US2] Frontend integration test for registration in `frontend/tests/integration/registration.test.tsx` (render RegisterPage → fill form → submit → verify redirect to dashboard)

### Implementation for User Story 2

#### Backend Implementation

- [ ] T067 [P] [US2] Create custom User serializer in `backend/authentication/serializers.py` with email/password fields
- [ ] T068 [P] [US2] Create RegisterSerializer in `backend/authentication/serializers.py` combining User fields + Professional fields with photo upload
- [ ] T069 [P] [US2] Implement password validation in RegisterSerializer (8+ chars, letter + number check)
- [ ] T070 [US2] Implement registration view in `backend/authentication/views.py` with atomic transaction (create User → hash password → create Professional → upload photo to S3 → return JWT tokens)
- [ ] T071 [US2] Add S3 photo upload logic in registration view using storage backend from Phase 2
- [ ] T072 [US2] Add email confirmation sending in registration view with try/except for failure handling
- [ ] T073 [US2] Add email retry queue logic for failed deliveries (log failure, queue for background retry)
- [ ] T074 [US2] Register auth URLs in `backend/authentication/urls.py` with register endpoint
- [ ] T075 [US2] Add logging for registration attempts (log email, timestamp, success/failure, photo upload status)
- [ ] T076 [US2] Add rate limiting to registration endpoint (max 5 attempts per IP per hour)

#### Frontend Implementation

- [ ] T077 [P] [US2] Create AuthForm component in `frontend/src/components/forms/AuthForm.tsx` with email/password inputs and validation
- [ ] T078 [P] [US2] Create ProfessionalForm component in `frontend/src/components/forms/ProfessionalForm.tsx` with all professional fields, photo upload (max 5MB), multi-select services
- [ ] T079 [P] [US2] Create authService API client in `frontend/src/services/authService.ts` with register(data), login(credentials), logout(), refreshToken()
- [ ] T080 [P] [US2] Create useForm hook in `frontend/src/hooks/useForm.ts` with validation logic and error state management
- [ ] T081 [US2] Implement RegisterPage in `frontend/src/pages/RegisterPage.tsx` combining AuthForm + ProfessionalForm with file upload
- [ ] T082 [US2] Add form validation to RegisterPage (email format, password requirements 8+ chars + letter + number, photo size <5MB, bio max 500 chars)
- [ ] T083 [US2] Add photo preview to RegisterPage before upload
- [ ] T084 [US2] Implement registration submission with multipart/form-data for photo upload
- [ ] T085 [US2] Add success/error handling with toast notifications or error messages
- [ ] T086 [US2] Add redirect to dashboard on successful registration with token storage
- [ ] T087 [US2] Create responsive layout for RegisterPage using TailwindCSS mobile-first approach
- [ ] T088 [US2] Add loading spinner during registration submission

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Professionals can register themselves, and their profiles immediately appear in client searches.

---

## Phase 5: User Story 3 - Professional Profile Management (Priority: P3)

**Goal**: Enable authenticated professionals to access their dashboard and edit all profile fields including services, pricing, bio, photo, and contact details, with changes appearing immediately in search results.

**Independent Test**: Login as professional, access dashboard, verify form is pre-filled with current data, modify services (add "Florais"), change price to R$175, update bio, upload new photo, save changes, verify success message, logout, search for professional, verify updated data appears in results.

### Tests for User Story 3 (MANDATORY - TDD Required) ⚠️

- [ ] T089 [P] [US3] Contract test for POST /api/v1/auth/login/ in `backend/tests/contract/test_auth_api.py` (verify login response with tokens)
- [ ] T090 [P] [US3] Contract test for POST /api/v1/auth/logout/ in `backend/tests/contract/test_auth_api.py` (verify token blacklisting)
- [ ] T091 [P] [US3] Contract test for POST /api/v1/auth/refresh/ in `backend/tests/contract/test_auth_api.py` (verify new access token)
- [ ] T092 [P] [US3] Contract test for PUT /api/v1/professionals/{id}/ in `backend/tests/contract/test_professionals_api.py` (verify update with auth)
- [ ] T093 [P] [US3] Contract test for PATCH /api/v1/professionals/{id}/ in `backend/tests/contract/test_professionals_api.py` (verify partial update)
- [ ] T094 [P] [US3] Contract test for authorization check in `backend/tests/contract/test_professionals_api.py` (verify 403 when updating other's profile)
- [ ] T095 [P] [US3] Integration test for login lockout in `backend/tests/integration/test_auth_flow.py` (5 failed attempts → 15-min lockout)
- [ ] T096 [P] [US3] Integration test for profile edit flow in `backend/tests/integration/test_profile_flow.py` (login → update profile → verify changes in search)
- [ ] T097 [P] [US3] Frontend integration test for dashboard in `frontend/tests/integration/dashboard.test.tsx` (render DashboardPage → verify pre-filled form → modify fields → save → verify success)

### Implementation for User Story 3

#### Backend Implementation

- [ ] T098 [P] [US3] Create LoginSerializer in `backend/authentication/serializers.py` with email/password validation
- [ ] T099 [P] [US3] Implement login view in `backend/authentication/views.py` with JWT token generation and failed attempt tracking
- [ ] T100 [US3] Add login attempt tracking in login view (Redis or DB cache for 5 attempts per 15-min window)
- [ ] T101 [US3] Add 15-minute lockout logic after 5 failed attempts with error message "Conta temporariamente bloqueada. Tente novamente em 15 minutos"
- [ ] T102 [P] [US3] Implement logout view in `backend/authentication/views.py` with JWT token blacklisting
- [ ] T103 [P] [US3] Implement token refresh view in `backend/authentication/views.py` returning new access token
- [ ] T104 [P] [US3] Implement update action in ProfessionalViewSet (PUT for full update, PATCH for partial)
- [ ] T105 [US3] Add permission class to ProfessionalViewSet in `backend/professionals/permissions.py` (IsOwnerOrReadOnly - only owner can edit)
- [ ] T106 [US3] Add photo replacement logic in update action (delete old S3 photo → upload new photo → update photo_url)
- [ ] T107 [US3] Add auto-refresh of updated_at timestamp on profile updates
- [ ] T108 [US3] Register login/logout/refresh URLs in `backend/authentication/urls.py`
- [ ] T109 [US3] Add logging for login attempts (log email, timestamp, success/failure, lockout status)
- [ ] T110 [US3] Add logging for profile updates (log user_id, fields changed, timestamp)

#### Frontend Implementation

- [ ] T111 [P] [US3] Implement LoginPage in `frontend/src/pages/LoginPage.tsx` with email/password form
- [ ] T112 [US3] Add login submission to LoginPage with token storage in localStorage and redirect to dashboard
- [ ] T113 [US3] Add error handling for invalid credentials and lockout messages
- [ ] T114 [P] [US3] Implement DashboardPage in `frontend/src/pages/DashboardPage.tsx` with authentication guard (redirect to login if not authenticated)
- [ ] T115 [US3] Fetch current professional data in DashboardPage using professionalService.getProfessionalById()
- [ ] T116 [US3] Render ProfessionalForm in DashboardPage pre-filled with current data
- [ ] T117 [US3] Implement profile update submission in DashboardPage using professionalService.updateProfessional()
- [ ] T118 [US3] Add photo replacement logic in DashboardPage (upload new photo → update form → submit)
- [ ] T119 [US3] Add success/error notifications for profile updates with toast or inline messages
- [ ] T120 [US3] Add logout button to DashboardPage that clears tokens and redirects to homepage
- [ ] T121 [US3] Add automatic token refresh logic in axios interceptor (refresh before access token expires if user active)
- [ ] T122 [US3] Create Navigation component in `frontend/src/components/Navigation.tsx` with login/logout links based on auth state
- [ ] T123 [US3] Add protected route wrapper for DashboardPage in `frontend/src/App.tsx`
- [ ] T124 [US3] Add loading state while fetching professional data in DashboardPage

**Checkpoint**: All core user stories should now be independently functional. Professionals can register, login, edit profiles, and clients can search/contact them.

---

## Phase 6: User Story 4 - Smooth Animations and Visual Feedback (Priority: P4)

**Goal**: Provide smooth, purposeful animations throughout the interface that enhance user experience and perception of quality.

**Independent Test**: Navigate through the platform observing: professional cards fade in with stagger effect when search loads, hover over cards shows scale animation, click card to open modal with smooth scale+fade transition, hover/click buttons shows tactile feedback, page transitions are smooth without layout shifts.

### Tests for User Story 4 (MANDATORY - TDD Required) ⚠️

- [ ] T125 [P] [US4] Frontend unit test for animation variants in `frontend/tests/unit/lib/animations.test.ts` (verify containerVariants, itemVariants, modalVariants, buttonVariants)
- [ ] T126 [P] [US4] Frontend integration test for stagger animation in `frontend/tests/integration/animations.test.tsx` (render professional grid → verify stagger timing 0.1s)
- [ ] T127 [P] [US4] Frontend integration test for modal animation in `frontend/tests/integration/animations.test.tsx` (open modal → verify scale 0.8→1.0 + opacity)

### Implementation for User Story 4

- [ ] T128 [P] [US4] Verify containerVariants in `frontend/src/lib/animations.ts` has staggerChildren: 0.1, delayChildren: 0.1
- [ ] T129 [P] [US4] Verify itemVariants in `frontend/src/lib/animations.ts` has hidden: opacity 0, y 20; visible: opacity 1, y 0, duration 0.4s
- [ ] T130 [P] [US4] Verify modalVariants in `frontend/src/lib/animations.ts` has scale 0.8→1.0 + opacity 0→1
- [ ] T131 [P] [US4] Verify buttonVariants in `frontend/src/lib/animations.ts` has whileHover: scale 1.05, whileTap: scale 0.95
- [ ] T132 [US4] Apply containerVariants to professional grid in HomePage using Motion div wrapper
- [ ] T133 [US4] Apply itemVariants to each ProfessionalCard using Motion div wrapper
- [ ] T134 [US4] Apply hover scale 1.03 + shadow increase to ProfessionalCard using TailwindCSS hover: classes + Motion whileHover
- [ ] T135 [US4] Apply modalVariants to ProfessionalModal using AnimatePresence for enter/exit animations
- [ ] T136 [US4] Apply buttonVariants to all buttons in ContactButtons using Motion button wrapper
- [ ] T137 [US4] Add AnimatePresence to App.tsx routing for smooth page transitions
- [ ] T138 [US4] Add exit animations to ProfessionalModal (scale 1.0→0.8 + opacity 1→0)
- [ ] T139 [US4] Verify no layout shifts during animations (test CLS < 0.1)
- [ ] T140 [US4] Add loading skeleton animations to HomePage while fetching data
- [ ] T141 [US4] Add subtle animations to form inputs on focus (border color transition)

**Checkpoint**: All user stories complete with polished animations. Platform feels professional and responsive.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final touches

- [ ] T142 [P] Add unit tests for Professional model validation in `backend/tests/unit/test_models.py` (test price range, attendance_type enum, services validation)
- [ ] T143 [P] Add unit tests for serializers in `backend/tests/unit/test_serializers.py` (test password validation, email validation, photo size validation)
- [ ] T144 [P] Add unit tests for ProfessionalCard component in `frontend/tests/unit/components/ProfessionalCard.test.tsx` (test props rendering, click handler)
- [ ] T145 [P] Add unit tests for SearchFilters component in `frontend/tests/unit/components/SearchFilters.test.tsx` (test filter state, submit handler)
- [ ] T146 [P] Add unit tests for authService in `frontend/tests/unit/services/authService.test.ts` (test API calls, error handling)
- [ ] T147 [P] Run mypy type checking on backend: `cd backend; mypy .` and fix any type errors
- [ ] T148 [P] Run TypeScript type checking on frontend: `cd frontend; npm run type-check` and fix any type errors
- [ ] T149 [P] Run ruff linting on backend: `cd backend; ruff check .` and fix issues
- [ ] T150 [P] Run ESLint on frontend: `cd frontend; npm run lint` and fix issues
- [ ] T151 [P] Run pytest with coverage: `cd backend; pytest --cov=. --cov-report=html` and verify 80% coverage
- [ ] T152 [P] Run vitest with coverage: `cd frontend; npm run test:coverage` and verify 70% coverage
- [ ] T153 [P] Performance audit: verify API response times <500ms for search queries (load test with 100 concurrent users)
- [ ] T154 [P] Performance audit: verify frontend bundle size <200KB gzipped (run `npm run build` and check dist/ size)
- [ ] T155 [P] Performance audit: verify LCP <2.5s on 3G throttled network using Chrome DevTools
- [ ] T156 [P] Accessibility audit: verify WCAG 2.1 Level AA compliance using axe DevTools
- [ ] T157 [P] Security audit: verify password hashing uses PBKDF2-SHA256, JWT tokens secure, CORS configured correctly
- [ ] T158 [P] Create seed data script in `backend/professionals/management/commands/seed_professionals.py` (create 50 sample professionals across all service types and cities)
- [ ] T159 Run quickstart.md validation: follow all setup steps from scratch and verify both backend and frontend run successfully
- [ ] T160 [P] Update README.md with project overview, tech stack, and link to quickstart.md
- [ ] T161 [P] Create Dockerfile for backend in `backend/Dockerfile` per deployment section in specs.md
- [ ] T162 [P] Create deployment configuration for AWS App Runner in `.aws/apprunner.yaml`
- [ ] T163 [P] Create Vercel configuration in `frontend/vercel.json` with environment variables
- [ ] T164 [P] Add API documentation using DRF browsable API and Swagger/OpenAPI schema generation
- [ ] T165 [P] Add error monitoring configuration (Sentry or similar) for production logging per FR-021, FR-022, FR-023
- [ ] T166 Code review and refactoring pass: remove dead code, improve naming, add docstrings
- [ ] T167 Final integration test: complete end-to-end flow (register professional → login → edit profile → logout → search as client → view detail → contact via WhatsApp)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if team has capacity)
  - Or sequentially in priority order: P1 (US1) → P2 (US2) → P3 (US3) → P4 (US4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1) - Client Search**: Can start after Foundational (Phase 2) - No dependencies on other stories
  - Delivers: Complete MVP - clients can discover and contact professionals
  - Blockers: None (after Phase 2)
  
- **User Story 2 (P2) - Professional Registration**: Can start after Foundational (Phase 2) - No dependencies on other stories
  - Delivers: Self-service onboarding for professionals
  - Integrates with: US1 (registered professionals appear in search)
  - Blockers: None (after Phase 2)
  
- **User Story 3 (P3) - Profile Management**: Depends on US2 (needs registration/login) but can be implemented in parallel if team coordinates
  - Delivers: Profile editing for professionals
  - Integrates with: US1 (updated profiles appear in search), US2 (uses same auth)
  - Blockers: US2 login implementation (T098-T103) must be complete
  
- **User Story 4 (P4) - Animations**: Can start after any UI components exist - typically after US1 frontend tasks
  - Delivers: Visual polish and UX enhancement
  - Integrates with: US1, US2, US3 (enhances all UI components)
  - Blockers: None (can apply incrementally as components are built)

### Within Each User Story

**Test-First Workflow (MANDATORY)**:
1. Write contract tests → Verify they FAIL
2. Write integration tests → Verify they FAIL
3. Implement backend models/services
4. Implement backend endpoints
5. Run backend tests → Verify they PASS
6. Implement frontend components
7. Implement frontend pages
8. Run frontend tests → Verify they PASS
9. Manual testing and refinement

**Implementation Order Within Story**:
- Tests (all marked [P] can run in parallel)
- Backend models (all marked [P] can run in parallel)
- Backend services (depends on models)
- Backend endpoints (depends on services)
- Frontend types and services (all marked [P] can run in parallel)
- Frontend components (all marked [P] can run in parallel)
- Frontend pages (integrates components)
- Integration and polish

### Parallel Opportunities

**Phase 1 (Setup)**: All tasks marked [P] can run in parallel (T003-T015)

**Phase 2 (Foundational)**: Most tasks marked [P] can run in parallel after T016 (T017-T026)

**User Story 1**:
- Tests: T029-T035 can all run in parallel
- Backend: T036, T040, T041, T044, T047 can run in parallel (T037-T043, T045-T046 have dependencies)
- Frontend: T048-T053 can all run in parallel (T054-T060 integrate these)

**User Story 2**:
- Tests: T061-T066 can all run in parallel
- Backend: T067-T069 can run in parallel (T070-T076 have dependencies)
- Frontend: T077-T080 can all run in parallel (T081-T088 integrate these)

**User Story 3**:
- Tests: T089-T097 can all run in parallel
- Backend: T098, T099, T102, T103, T104 can run in parallel (T100-T101, T105-T110 have dependencies)
- Frontend: T111, T114 can run in parallel (T112-T124 have dependencies)

**User Story 4**:
- Tests: T125-T127 can all run in parallel
- Implementation: T128-T131 can run in parallel (T132-T141 have dependencies)

**Phase 7 (Polish)**: Most tasks T142-T166 can run in parallel (T167 is final integration)

---

## Parallel Example: User Story 1 Backend

```bash
# Team of 3 developers can work simultaneously:

# Developer A: Models and database
Task T036: Create Professional model
Task T037: Create migration
Task T038: Apply migration
Task T039: Create indexes

# Developer B: Serializers and filters
Task T040: Create Professional serializer
Task T041: Create ProfessionalFilter class
Task T044: Create service types constant

# Developer C: API endpoints
# (waits for A and B to complete, then implements)
Task T042: Implement ProfessionalViewSet list action
Task T043: Implement retrieve action
Task T045: Implement service-types endpoint
Task T046: Register URLs
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) 🎯 RECOMMENDED

**Goal**: Validate core value proposition with minimal scope

1. ✅ Complete Phase 1: Setup (T001-T015)
2. ✅ Complete Phase 2: Foundational (T016-T028) - CRITICAL BLOCKER
3. ✅ Complete Phase 3: User Story 1 (T029-T060)
4. **STOP and VALIDATE**: 
   - Manually create 10-20 professional profiles via Django admin
   - Test client search with various filters
   - Test professional detail view and contact buttons
   - Verify API performance <500ms
   - Verify frontend bundle <200KB
   - Verify mobile responsiveness
5. **Decision Point**: 
   - ✅ MVP validated → Deploy and gather feedback → Proceed to US2
   - ❌ Issues found → Fix before proceeding

**Time Estimate**: 2-3 weeks for MVP with TDD approach

---

### Incremental Delivery (Full MVP)

**Goal**: Deliver complete MVP with all P1-P3 stories

1. ✅ Complete Setup + Foundational (Phase 1-2) → ~1 week
2. ✅ Complete User Story 1 → Test independently → ~1-2 weeks → **Deploy MVP v0.1**
3. ✅ Complete User Story 2 → Test independently → ~1 week → **Deploy MVP v0.2**
4. ✅ Complete User Story 3 → Test independently → ~1 week → **Deploy MVP v0.3**
5. ✅ Complete User Story 4 → Test independently → ~3-4 days → **Deploy MVP v1.0**
6. ✅ Complete Polish (Phase 7) → ~1 week → **Production Ready**

**Total Time Estimate**: 6-8 weeks with TDD approach

**Benefits**:
- Each phase adds value without breaking previous features
- Early feedback from users after US1 and US2
- Can stop at any user story and have a functional product
- Easier debugging (know which phase introduced issues)

---

### Parallel Team Strategy

**Goal**: Maximize throughput with multiple developers

**Prerequisites**: Phase 1-2 completed by entire team together (~1 week)

**Team of 4 Developers**:

- **Developer A (Backend Specialist)**: 
  - Phase 3: US1 backend (T029-T047) → ~1 week
  - Phase 4: US2 backend (T061-T076) → ~1 week
  - Phase 5: US3 backend (T089-T110) → ~1 week
  
- **Developer B (Frontend Specialist)**:
  - Phase 3: US1 frontend (T048-T060) → ~1 week
  - Phase 4: US2 frontend (T077-T088) → ~1 week
  - Phase 5: US3 frontend (T111-T124) → ~1 week
  
- **Developer C (Full Stack)**:
  - Phase 6: US4 animations (T125-T141) → ~3-4 days (can start after US1 frontend)
  - Phase 7: Polish tasks, testing, deployment (T142-T167) → ~1 week
  
- **Developer D (QA/Testing Lead)**:
  - Write and maintain all contract/integration tests
  - Coordinate TDD workflow (ensure tests written first)
  - Run continuous testing and report issues
  - Performance and accessibility audits

**Timeline**: 4-5 weeks with parallel execution (vs 6-8 weeks sequential)

**Risk**: Requires strong coordination to avoid merge conflicts and integration issues

---

## Notes

- **[P] tasks**: Different files, no dependencies - safe to parallelize
- **[Story] label**: Maps task to specific user story for traceability
- **TDD Mandatory**: Write tests FIRST (T029-T035, T061-T066, T089-T097, T125-T127), verify they FAIL, then implement
- **Each user story independently testable**: Can stop at any phase and have a working feature
- **Commit frequency**: Commit after each task or logical group of related tasks
- **Checkpoints**: Stop at each checkpoint to validate story works independently before proceeding
- **MVP = User Story 1**: This alone provides core marketplace value (search + contact)
- **Avoid**: Vague tasks, same-file conflicts, cross-story dependencies that break independence

---

## Task Statistics

**Total Tasks**: 167
- **Phase 1 (Setup)**: 15 tasks
- **Phase 2 (Foundational)**: 13 tasks (BLOCKS all user stories)
- **Phase 3 (US1 - P1)**: 32 tasks (7 tests + 25 implementation) 🎯 MVP
- **Phase 4 (US2 - P2)**: 28 tasks (6 tests + 22 implementation)
- **Phase 5 (US3 - P3)**: 36 tasks (9 tests + 27 implementation)
- **Phase 6 (US4 - P4)**: 14 tasks (3 tests + 11 implementation)
- **Phase 7 (Polish)**: 26 tasks

**Parallelizable Tasks**: 89 tasks marked [P] (53% of total)

**Test Tasks**: 25 (all marked MANDATORY per constitution)

**MVP Scope**: Phases 1 + 2 + 3 = 60 tasks (36% of total)

**Independent Stories**: All 4 user stories can be tested independently after their respective phases complete

# Research: HolisticMatch Marketplace Platform

**Feature**: 001-holistic-marketplace  
**Phase**: 0 - Outline & Research  
**Date**: 2025-10-31

## Purpose

Resolve technical unknowns, establish best practices, and validate technology choices for implementing the HolisticMatch marketplace platform.

## Technology Stack Decisions

### Backend Framework: Django 4.2 + Django REST Framework

**Decision**: Use Django 4.2 with Django REST Framework for backend API

**Rationale**:
- Mature, batteries-included framework with excellent PostgreSQL support
- Django REST Framework provides robust serialization, authentication, and API documentation
- Strong ecosystem for required features: JWT auth (dj-rest-auth), filtering (django-filter), CORS
- Built-in ORM with migrations supports complex queries needed for search/filtering
- Excellent security defaults (CSRF, SQL injection protection, XSS prevention)
- Type hint support via django-stubs for mypy compatibility

**Alternatives Considered**:
- **FastAPI**: Faster but less mature ecosystem, would require more custom authentication/admin tooling
- **Flask**: Too minimal, would need to build many features from scratch
- **Node.js (Express/NestJS)**: Team has Python expertise; Django's admin panel valuable for data management

**Best Practices**:
- Use Django apps for separation of concerns (professionals, authentication, storage)
- Implement service layer for business logic to keep views thin
- Use Django's class-based views with DRF ViewSets for consistent API patterns
- Leverage Django signals sparingly (only for cross-app events like email sending)
- Use Django Debug Toolbar in development for query profiling

### Frontend: React 18 + TypeScript + Vite

**Decision**: React 18 with TypeScript, bundled with Vite

**Rationale**:
- React 18 provides concurrent features and improved performance
- TypeScript strict mode enforces type safety per constitution requirements
- Vite offers fast development server (HMR <100ms) and optimized production builds
- Large ecosystem for required libraries: React Router, Framer Motion, TailwindCSS
- React Query excellent for caching and API state management (5-minute stale time requirement)
- Component-based architecture aligns with mobile-first, reusable design system needs

**Alternatives Considered**:
- **Next.js**: Adds SSR complexity not needed for marketplace; SEO handled via meta tags
- **Vue 3**: Smaller ecosystem for animation libraries; team has React experience
- **Svelte**: Less mature ecosystem, fewer animation options

**Best Practices**:
- Use React Query for all API calls (automatic caching, refetching, error handling)
- Implement code splitting at route level to stay under 200KB bundle budget
- Use React.memo() for expensive re-renders (ProfessionalCard grid)
- Leverage Suspense for lazy-loaded components
- Use custom hooks for reusable logic (useAuth, useProfessionals, useForm)

### Database: Supabase PostgreSQL with Row Level Security

**Decision**: Supabase managed PostgreSQL with Row Level Security enabled

**Rationale**:
- Managed PostgreSQL with automatic backups and connection pooling (pgBouncer)
- PostGIS extension available for future geographic search enhancements
- Row Level Security provides database-level authorization for professional profile access
- Supabase Dashboard useful for monitoring queries and database health
- JSON column support for services array (no separate junction table needed for MVP)
- Excellent Django support via psycopg2-binary

**Alternatives Considered**:
- **AWS RDS**: More expensive, requires manual configuration of backups/pooling
- **MongoDB**: NoSQL not ideal for relational data (users ↔ professionals); weaker ACID guarantees

**Best Practices**:
- Create indexes on frequently queried columns: city, is_active, price_per_session
- Use compound index on (city, is_active) for most common search pattern
- Enable RLS policies: professionals can only update their own profiles
- Use Django migrations to manage schema changes
- Implement database query logging in development to catch N+1 problems

### Storage: AWS S3 for Profile Photos

**Decision**: AWS S3 with django-storages integration

**Rationale**:
- Reliable, scalable object storage with 99.99% availability SLA
- Public URL generation for profile photos (no pre-signed URL complexity for public reads)
- Lifecycle policies for archiving old photos (cost optimization)
- Integration with CloudFront CDN for future image optimization
- django-storages provides seamless Django file field integration

**Alternatives Considered**:
- **Supabase Storage**: Adds dependency on second storage provider; S3 more mature
- **Cloudinary**: More expensive; S3 sufficient for static image storage

**Best Practices**:
- Generate unique filenames with UUID to prevent overwriting
- Store multiple sizes: original, 300x300 thumbnail, 150x150 micro-thumbnail
- Use Pillow to resize/compress on upload (JPEG quality 85, WebP with fallback)
- Set cache headers (1 year TTL for immutable image URLs)
- Implement cleanup: delete old photo when professional uploads new one
- Use environment variables for bucket name/region (different per environment)

### Authentication: JWT with dj-rest-auth

**Decision**: JWT tokens via dj-rest-auth + djangorestframework-simplejwt

**Rationale**:
- Stateless authentication supports horizontal scaling (no session storage)
- dj-rest-auth provides registration, login, logout, password reset endpoints
- djangorestframework-simplejwt handles token generation/validation/refresh
- 24-hour access tokens + 7-day refresh tokens balance security and UX
- Tokens stored in localStorage (frontend) and HttpOnly cookies (refresh token)

**Alternatives Considered**:
- **Session-based auth**: Requires sticky sessions or shared session store; harder to scale
- **OAuth2**: Overkill for simple email/password authentication; adds complexity

**Best Practices**:
- Rotate refresh tokens on use (refresh token rotation for enhanced security)
- Include user_id and professional_id in token payload for quick authorization checks
- Implement token blacklist on logout (djangorestframework-simplejwt feature)
- Auto-refresh access token in frontend when <5 minutes until expiry
- Set secure, httpOnly, sameSite flags on refresh token cookie

### Deployment: AWS App Runner + Vercel

**Decision**: AWS App Runner for backend, Vercel for frontend

**Rationale**:
- **App Runner**: Simplified container deployment with auto-scaling (min 1, max 10 instances)
  - Automatic HTTPS, health checks, rolling deployments
  - Direct GitHub integration for CI/CD
  - Integrated with AWS services (S3, Secrets Manager)
- **Vercel**: Optimized for React/Vite with edge CDN and automatic preview deployments
  - Sub-second global page loads via Vercel Edge Network
  - Automatic preview URLs for every PR
  - Built-in analytics for Core Web Vitals monitoring

**Alternatives Considered**:
- **Heroku**: More expensive; less AWS integration; uncertain future post-Salesforce acquisition
- **AWS ECS**: More complex setup; App Runner abstracts infrastructure management
- **Netlify**: Similar to Vercel but Vercel has better React/Vite optimization

**Best Practices**:
- Use separate environments: dev, staging, production
- Implement health check endpoint: `/api/v1/health/` returns 200 + database connectivity
- Set App Runner auto-scaling based on CPU (scale up at 70%, scale down at 30%)
- Use AWS Secrets Manager for production credentials (DATABASE_URL, AWS keys, Django secret)
- Configure Vercel environment variables per environment
- Enable Vercel Analytics to track Core Web Vitals (LCP, FID, CLS)

## API Design Patterns

### REST API Structure

**Decision**: RESTful API with `/api/v1/` versioning

**Pattern**:
```
/api/v1/auth/register/          POST   - Create professional account
/api/v1/auth/login/             POST   - Obtain JWT tokens
/api/v1/auth/logout/            POST   - Blacklist tokens
/api/v1/auth/refresh/           POST   - Refresh access token
/api/v1/professionals/          GET    - List/search professionals (paginated)
/api/v1/professionals/          POST   - Create profile (authenticated)
/api/v1/professionals/{id}/     GET    - Retrieve single professional
/api/v1/professionals/{id}/     PUT    - Update profile (owner only)
/api/v1/professionals/{id}/     PATCH  - Partial update (owner only)
/api/v1/service-types/          GET    - List available service types
```

**Rationale**:
- URL versioning (`/v1/`) allows backward-compatible API evolution
- Plural resource names (`professionals` not `professional`)
- Standard HTTP methods map to CRUD operations
- Consistent error responses with `error` and `message` fields

**Best Practices**:
- Return 201 Created for POST requests with Location header
- Use 400 Bad Request for validation errors with detailed field-level messages
- Implement 429 Too Many Requests with Retry-After header for rate limiting
- Include pagination metadata: `count`, `next`, `previous` URLs
- Support query parameters for filtering: `?service=Reiki&city=São Paulo&max_price=200`

### Pagination Strategy

**Decision**: Limit/offset pagination for MVP

**Rationale**:
- Simple to implement with Django's built-in pagination
- Works well with filtering (service type, city, price)
- Page numbers intuitive for users ("Página 1 de 5")
- Sufficient for initial scale (<10k professionals)

**Configuration**:
- Default page size: 12 professionals (matches spec requirement)
- Max page size: 50 (prevent abuse)
- Include page metadata in response

**Future Consideration**: Cursor-based pagination if dataset grows >10k profiles (more efficient for large datasets)

### Filtering Implementation

**Decision**: django-filter for query parameter filtering

**Rationale**:
- Declarative filtering syntax integrates with DRF
- Supports exact, iexact (case-insensitive), lte (max price), contains (services JSON)
- Automatically generates OpenAPI schema documentation
- Type-safe with proper serializer integration

**Filters**:
- `service`: Exact match in services JSON array (uses `__contains` lookup)
- `city`: Case-insensitive partial match (uses `__icontains`)
- `max_price`: Less than or equal (uses `__lte`)
- `attendance_type`: Exact match or "both" (custom logic)
- `is_active`: Always filtered to true (implicit, not user-facing)

## Performance Optimization Strategies

### Backend Performance

**Target**: API p95 response time < 500ms

**Strategies**:
1. **Database Indexing**:
   - Composite index on `(city, is_active)` for most common query
   - Index on `price_per_session` for range queries
   - Index on `created_at` for sorting tiebreakers
   
2. **Query Optimization**:
   - Use `select_related('user')` for single professional queries to avoid N+1
   - Implement Django Debug Toolbar in dev to identify slow queries
   - Lazy load related objects not needed in list view
   
3. **Caching**:
   - Cache service types list (changes rarely): 24-hour TTL
   - Cache city autocomplete (if implemented): 1-hour TTL
   - Don't cache professional profiles (real-time updates required per FR-011)
   
4. **Response Optimization**:
   - Use DRF's `fields` optimization for list vs. detail serializers
   - Compress responses with gzip middleware
   - Return only necessary fields in list view (exclude full bio)

### Frontend Performance

**Target**: Bundle < 200KB gzipped, LCP < 2.5s, TTI < 3s

**Strategies**:
1. **Code Splitting**:
   - Lazy load routes: `React.lazy(() => import('./pages/DashboardPage'))`
   - Lazy load Framer Motion (tree-shake unused animations)
   - Split vendor chunks: React/React-DOM separate from app code
   
2. **Asset Optimization**:
   - Use WebP images with JPEG fallback (`<picture>` element)
   - Lazy load images below fold with Intersection Observer
   - Implement blur-up placeholder (low-res preview while loading)
   - Use `loading="lazy"` attribute on images
   
3. **Bundle Size Management**:
   - Analyze bundle with `vite-bundle-visualizer`
   - Tree-shake TailwindCSS (only include used utilities)
   - Use Framer Motion's lightweight `motion` components (not full library)
   - Avoid moment.js (use date-fns with tree-shaking)
   
4. **React Query Configuration**:
   - Set staleTime: 5 minutes (reduce refetches)
   - Set cacheTime: 10 minutes (keep data in memory)
   - Prefetch professional details on card hover (optimistic UX)
   
5. **Animation Performance**:
   - Use CSS transforms (translate, scale) not layout properties (top, left)
   - Limit animations to composited properties (transform, opacity)
   - Use `will-change` sparingly for animation-heavy components
   - Implement frame rate throttling for scroll-based animations

### Image Upload Optimization

**Strategy**: Resize/compress on server before S3 upload

**Implementation**:
```python
# Backend processing
from PIL import Image
from io import BytesIO

def process_photo_upload(uploaded_file):
    img = Image.open(uploaded_file)
    
    # Resize to max 1000px width maintaining aspect ratio
    if img.width > 1000:
        ratio = 1000 / img.width
        new_size = (1000, int(img.height * ratio))
        img = img.resize(new_size, Image.LANCZOS)
    
    # Generate thumbnail 300x300 (crop to square)
    thumb = img.copy()
    thumb.thumbnail((300, 300), Image.LANCZOS)
    
    # Save as JPEG quality 85
    buffer = BytesIO()
    img.save(buffer, format='JPEG', quality=85, optimize=True)
    
    return buffer, thumb
```

**Storage Structure**:
```
s3://holisticmatch-storage/
  professionals/
    {uuid}/
      original.jpg      # Compressed original (max 1000px)
      thumb_300.jpg     # 300x300 thumbnail
      thumb_150.jpg     # 150x150 micro-thumbnail
```

## Security Best Practices

### Password Security

**Implementation**:
- Use Django's `AbstractBaseUser` with `make_password()` (PBKDF2 hashing)
- Enforce password requirements via serializer validation:
  - Minimum 8 characters
  - At least one letter
  - At least one number
- Implement password strength indicator in frontend (zxcvbn library)

### Rate Limiting

**Strategy**: Django Ratelimit package

**Limits**:
- Authentication endpoints: 5 requests/minute per IP
- Registration: 3 requests/hour per IP (prevent spam accounts)
- Search API: 30 requests/minute per IP (generous for legitimate browsing)
- Profile updates: 10 requests/minute per user (prevent rapid changes)

### Input Validation

**Backend**:
- Use DRF serializers for all input validation (field-level and object-level)
- Validate file uploads: max 5MB, JPEG/PNG only
- Sanitize WhatsApp numbers: enforce +55 format with regex
- Validate bio length: max 500 characters
- Validate price range: min R$50, max R$500

**Frontend**:
- Client-side validation mirrors backend rules (better UX)
- Never trust client validation alone (defense in depth)
- Sanitize user input before rendering (React does this by default, but verify for `dangerouslySetInnerHTML` usage)

### CORS Configuration

**Settings**:
```python
CORS_ALLOWED_ORIGINS = [
    "https://holisticmatch.com",
    "https://www.holisticmatch.com",
    "http://localhost:3000",  # Development only
]
CORS_ALLOW_CREDENTIALS = True  # For cookie-based refresh tokens
```

## Testing Strategy

### Backend Testing

**Test Levels**:
1. **Contract Tests** (`tests/contract/`):
   - Verify API endpoints match OpenAPI spec
   - Test request/response schemas
   - Validate status codes and error responses
   - Example: `test_auth_api.py`, `test_professionals_api.py`

2. **Integration Tests** (`tests/integration/`):
   - Test complete user flows end-to-end
   - Use Django's test client
   - Create fixtures for test data
   - Example: `test_registration_flow.py` (register → login → create profile → search)

3. **Unit Tests** (`tests/unit/`):
   - Test models, services, utilities in isolation
   - Mock external dependencies (S3, email service)
   - Fast execution (<1s per test suite)
   - Example: `test_models.py`, `test_services.py`

**Coverage Target**: 80% minimum for business logic

**Tools**:
- pytest with pytest-django
- pytest-cov for coverage reporting
- factory_boy for test data generation
- pytest-mock for mocking external services

### Frontend Testing

**Test Levels**:
1. **Integration Tests** (`tests/integration/`):
   - Test user journeys with MSW (Mock Service Worker) for API mocking
   - Verify search filters work together
   - Test registration form validation and submission
   - Example: `search.test.tsx`, `registration.test.tsx`

2. **Component Tests** (`tests/unit/components/`):
   - Use React Testing Library (no Enzyme)
   - Test component behavior, not implementation details
   - Mock Framer Motion to avoid animation complexity in tests
   - Example: `ProfessionalCard.test.tsx`, `SearchFilters.test.tsx`

3. **Service Tests** (`tests/unit/services/`):
   - Test API service functions with mocked axios
   - Verify request/response transformation
   - Test error handling
   - Example: `authService.test.ts`, `professionalService.test.ts`

**Coverage Target**: 70% minimum (animations excluded from coverage)

**Tools**:
- vitest (Vite-native test runner)
- React Testing Library
- MSW (Mock Service Worker) for API mocking
- @testing-library/user-event for user interactions

## Monitoring & Observability

### Logging Strategy

**Backend**:
- Use Python's standard logging module with JSON formatter
- Log levels: ERROR (all errors), INFO (user actions), DEBUG (development only)
- Include context: user_id, professional_id, request_id, timestamp
- Log to stdout (captured by App Runner)

**Events to Log**:
- Authentication: login attempts (success/failure), logout, token refresh
- Professional actions: registration, profile updates, photo uploads
- Search queries: service type, city, price range (for analytics)
- API errors: exceptions, validation failures, external service failures
- Performance: slow queries (>500ms), slow API calls

**Frontend**:
- Use Vercel Analytics for Core Web Vitals
- Log frontend errors to backend endpoint: `/api/v1/frontend-errors/`
- Include: error message, stack trace, user agent, URL, timestamp

### Metrics to Track

**Backend Metrics** (via App Runner + CloudWatch):
- API response times (p50, p95, p99)
- Error rate (5xx responses)
- Request rate (requests per second)
- Database connection pool usage
- S3 upload success/failure rate

**Frontend Metrics** (via Vercel Analytics):
- Largest Contentful Paint (LCP) target: <2.5s
- First Input Delay (FID) target: <100ms
- Cumulative Layout Shift (CLS) target: <0.1
- Time to Interactive (TTI) target: <3s on 3G
- Bundle size trend (monitor for regressions)

### Alerting

**Critical Alerts**:
- API error rate >5% for 5 minutes
- API p95 response time >1s for 5 minutes
- Database connection errors
- S3 upload failures >10% for 5 minutes
- App Runner unhealthy instances

**Warning Alerts**:
- API p95 response time >500ms for 15 minutes
- Bundle size exceeds 200KB
- Frontend LCP >2.5s for 50% of users

## Development Workflow

### Environment Setup

**Backend**:
```bash
# Python virtual environment
python3.11 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt  # pytest, mypy, black, etc.

# Environment variables
cp .env.example .env
# Edit .env with local Supabase credentials

# Database migrations
python manage.py migrate

# Run development server
python manage.py runserver
```

**Frontend**:
```bash
# Node.js dependencies
npm install

# Environment variables
cp .env.example .env.local
# Edit .env.local with API URL

# Run development server
npm run dev

# Type checking
npm run typecheck
```

### Code Quality Tools

**Backend**:
- **Black**: Auto-formatter (line length 88)
- **isort**: Import sorting
- **flake8**: Linting
- **mypy**: Static type checking
- **pytest**: Testing

**Frontend**:
- **Prettier**: Auto-formatter
- **ESLint**: Linting with TypeScript rules
- **TypeScript**: Type checking (strict mode)
- **vitest**: Testing

### CI/CD Pipeline

**On Pull Request**:
1. Run linters (Black, ESLint)
2. Run type checkers (mypy, TypeScript)
3. Run all tests (pytest, vitest)
4. Generate coverage report
5. Check bundle size (fail if >200KB)
6. Deploy preview (Vercel for frontend, App Runner staging for backend)

**On Merge to Main**:
1. Run full test suite
2. Build Docker image (backend)
3. Deploy to production (App Runner + Vercel)
4. Run smoke tests against production

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| S3 upload failures block registration | High | Low | Implemented in FR-013a: allow registration to succeed, retry upload in background |
| Search performance degrades with >1000 professionals | Medium | Medium | Database indexing on search columns; monitor query performance; switch to cursor pagination if needed |
| Bundle size exceeds 200KB with animations | Medium | Low | Code splitting, lazy loading, bundle analyzer in CI; Framer Motion tree-shaking |
| JWT token theft via XSS | High | Low | HttpOnly cookies for refresh tokens, short-lived access tokens (24h), input sanitization |
| Email service downtime prevents confirmations | Low | Medium | Handled in FR-013a: registration succeeds, email queued for retry |
| Supabase connection pool exhaustion | Medium | Low | pgBouncer connection pooling; set max connections in Django; monitor connection usage |
| Frontend animation performance on low-end devices | Medium | Medium | Use CSS transforms only; test on low-end Android devices; provide reduced motion option |

## Next Steps

Phase 0 research complete. Proceeding to Phase 1:
1. Generate `data-model.md` with database schema
2. Create OpenAPI contracts in `contracts/` directory
3. Write `quickstart.md` for developer onboarding
4. Update agent context with technology stack

<!--
Sync Impact Report:
- Version change: INITIAL → 1.0.0
- New constitution created for HolisticMatch project
- Principles established: 7 core principles covering code quality, testing, UX, performance, and architecture
- Templates alignment: All templates (plan, spec, tasks) verified compatible
- Ratification date: 2025-10-31 (project initialization)
- Follow-up: Monitor constitution compliance during first sprint cycles
-->

# HolisticMatch Constitution

## Core Principles

### I. Code Quality & Type Safety

All code MUST prioritize readability, maintainability, and type safety:

- **Backend (Django)**: Type hints MUST be used for all function signatures, class methods,
  and complex data structures. Use `mypy` for static type checking.
- **Frontend (React/TypeScript)**: TypeScript MUST be used throughout with strict mode enabled.
  No `any` types except when interfacing with untyped third-party libraries (document why).
- **Clean Code**: Functions MUST be single-purpose with descriptive names. Maximum function
  length: 50 lines. Maximum file length: 400 lines. Complex logic MUST be extracted and
  documented.
- **Code Reviews**: All PRs require type safety verification and adherence to project style
  guides (Black for Python, Prettier for TypeScript).

**Rationale**: Type safety catches bugs at compile time. Clean code reduces cognitive load
and accelerates onboarding. This is a marketplace platform where data integrity and
maintainability are critical for long-term success.

### II. Test-First Development (NON-NEGOTIABLE)

Test-Driven Development is MANDATORY for all features:

- **Red-Green-Refactor**: Write failing tests first → Implement → Refactor. No exceptions.
- **Backend Testing**: Use `pytest` with `pytest-django`. Minimum 80% coverage for business
  logic. All API endpoints MUST have contract tests.
- **Frontend Testing**: Use `vitest` for unit tests, React Testing Library for component
  tests. Critical user flows (search, profile creation) MUST have integration tests.
- **Test Organization**: Group tests by user story in tasks.md. Each story MUST be
  independently testable.
- **CI/CD Gate**: All tests MUST pass before merge. No bypassing test failures.

**Rationale**: Marketplace platforms require high reliability. Users expect search,
filtering, and profile management to work flawlessly. TDD ensures features work as
specified and prevents regressions.

### III. User Experience Excellence

User experience is paramount - the platform MUST feel professional and delightful:

- **Motion & Animations**: Use Framer Motion for all page transitions, list staggering,
  and interactive feedback. Animations MUST be purposeful, not gratuitous (max 300ms).
- **Responsive Design**: Mobile-first approach MANDATORY. All features MUST work on
  320px+ screens. Test on iOS Safari, Android Chrome, and desktop browsers.
- **Accessibility**: WCAG 2.1 Level AA compliance required. All interactive elements
  MUST be keyboard accessible. Use semantic HTML and ARIA labels.
- **Loading States**: Never show blank screens. Use skeleton loaders, optimistic updates,
  and clear error messages. Users MUST always know what's happening.
- **Design System**: Use TailwindCSS utility classes consistently. Maintain design tokens
  for colors, spacing, typography in a central configuration.

**Rationale**: Holistic therapy seekers value calm, professional experiences. Professionals
need mobile-optimized tools to manage profiles on-the-go. Poor UX directly impacts
conversion and retention.

### IV. Performance Standards

Performance directly impacts user trust and conversion:

- **Backend API**: Response time p95 MUST be < 500ms. Database queries MUST use indexes
  for all search/filter operations. Use Django Debug Toolbar to profile endpoints.
- **Frontend Bundle**: Initial bundle size MUST be < 200KB gzipped. Use code splitting
  for routes. Lazy load images with proper placeholder/blur handling.
- **Image Optimization**: All uploads to S3 MUST be resized and compressed. Generate
  thumbnails (150x150, 300x300) at upload time. Serve WebP with JPEG fallback.
- **Caching Strategy**: Use Django cache framework for expensive queries (service types,
  locations). Frontend MUST cache API responses with React Query (5-minute stale time).
- **Performance Budget**: Monitor bundle size in CI. Block PRs that exceed budget without
  explicit justification and optimization plan.

**Rationale**: Users abandon searches that take >3 seconds. Mobile users in Brazil often
have limited bandwidth. Fast, efficient experiences are non-negotiable for marketplace
success.

### V. REST API Design Consistency

API design MUST be consistent, predictable, and well-documented:

- **REST Conventions**: Use standard HTTP methods (GET, POST, PUT, PATCH, DELETE).
  Endpoints follow `/api/{version}/{resource}/{id}` pattern.
- **Status Codes**: Use appropriate codes (200, 201, 400, 401, 403, 404, 500). Include
  error details in JSON with `error` and `message` fields.
- **Pagination**: All list endpoints MUST support pagination (limit/offset or cursor).
  Default page size: 20 items. Include `next`, `previous`, `count` in responses.
- **Filtering**: Search endpoints MUST support query params for filters (service_type,
  city, max_price, location_type). Use Django Filter for consistent implementation.
- **Versioning**: API version in URL path (`/api/v1/`). Deprecation policy: 6-month notice
  with clear migration docs before removing old version.
- **Documentation**: Use Django REST Framework's schema generation + Swagger UI. All
  endpoints MUST have example requests/responses.

**Rationale**: Consistent APIs reduce frontend complexity and bugs. Clear documentation
enables future mobile app development and third-party integrations.

### VI. Database & Infrastructure Architecture

Architectural decisions MUST align with scalability and maintainability goals:

- **Supabase PostgreSQL**: Use as primary database. Leverage PostGIS for location-based
  search. Connection pooling via pgBouncer. Keep migrations reversible.
- **AWS S3**: All user-uploaded content (photos) stored in S3. Use presigned URLs for
  uploads. Implement lifecycle policies (archive after 2 years, delete after 5 years
  for inactive accounts).
- **AWS App Runner**: Backend deployment. Use auto-scaling (min 1, max 10 instances).
  Health checks on `/api/health/` endpoint. Zero-downtime deployments required.
- **Vercel Frontend**: Deploy main branch to production, PRs to preview environments.
  Use Vercel Analytics for performance monitoring.
- **Authentication**: JWT tokens via `dj-rest-auth`. Token expiry: 24 hours. Refresh
  tokens: 7 days. Store refresh tokens in HttpOnly cookies.
- **Secrets Management**: Use AWS Secrets Manager for production credentials. Never
  commit secrets to Git. Use `.env` files for local development (excluded from Git).

**Rationale**: Supabase provides managed PostgreSQL with excellent Django support.
AWS infrastructure scales with demand. JWT enables stateless API design. Proper secrets
management prevents security breaches.

### VII. Simplicity & YAGNI

Build what's needed now, not what might be needed later:

- **MVP Focus**: Implement only features defined in current specs. No speculative features.
  No "just in case" abstractions. Solve problems when they exist, not before.
- **Dependency Discipline**: Evaluate new dependencies carefully. Each new package adds
  maintenance burden and security risk. Prefer Django/React ecosystem libraries.
- **Refactor When Needed**: Don't over-engineer upfront. Extract abstractions when you see
  duplication (Rule of Three). Refactoring is normal and expected.
- **Configuration**: Avoid premature configurability. Hard-code reasonable defaults.
  Make things configurable only when multiple real use cases emerge.
- **Delete Code**: Unused code MUST be deleted, not commented out. Git history preserves
  everything. Dead code creates confusion and technical debt.

**Rationale**: HolisticMatch is an MVP marketplace. Speed to market matters. Simple code
is easier to change, test, and debug. Complexity is the enemy of maintainability.

## Performance Benchmarks

All features MUST meet these performance standards before deployment:

### Backend Performance

- API endpoint p95 response time < 500ms (measured via Django Debug Toolbar + APM)
- Database query time p95 < 100ms (use indexes, avoid N+1 queries)
- Professional search with filters < 300ms
- Image upload + S3 storage < 2 seconds
- Authentication endpoints < 200ms

### Frontend Performance

- Initial bundle size < 200KB gzipped
- Time to Interactive (TTI) < 3 seconds on 3G
- Largest Contentful Paint (LCP) < 2.5 seconds
- First Input Delay (FID) < 100ms
- Cumulative Layout Shift (CLS) < 0.1
- Image lazy loading with blur placeholders

### Monitoring

- Use Django Debug Toolbar in development for query profiling
- Implement Vercel Analytics for frontend performance tracking
- Set up AWS CloudWatch alarms for API p95 > 500ms
- Monitor bundle size in CI/CD pipeline (fail builds on regressions)

**Justification Required**: Any feature exceeding these benchmarks MUST document why and
provide optimization plan before merge.

## Security & Data Privacy

User data protection and security MUST be prioritized:

- **Input Validation**: Validate and sanitize all user inputs. Use Django forms/serializers
  for validation. Never trust client-side validation alone.
- **SQL Injection**: Use Django ORM exclusively. Raw SQL queries MUST be reviewed and use
  parameterized queries.
- **XSS Prevention**: React escapes by default. Use `dangerouslySetInnerHTML` only with
  sanitized content (use DOMPurify).
- **CSRF Protection**: Django CSRF middleware enabled. All POST/PUT/DELETE require CSRF
  token.
- **HTTPS Only**: All production traffic MUST use HTTPS. Set HSTS headers. Use secure
  cookies.
- **File Upload Security**: Validate file types and sizes. Scan uploads for malware.
  Limit file size to 5MB for photos.
- **Rate Limiting**: Implement rate limiting on authentication endpoints (5 attempts/min)
  and search APIs (30 requests/min per IP).
- **Data Privacy**: Comply with LGPD (Brazilian data protection law). Users MUST be able
  to export and delete their data. Log all data access for audit.

**Security Reviews**: Any authentication, payment, or data access feature MUST undergo
security review before production deployment.

## Development Workflow

All development MUST follow this workflow:

1. **Feature Specification**: Create spec in `.specify/` using `/speckit.specify` command.
   Spec MUST include user stories, acceptance criteria, and test scenarios.

2. **Planning**: Generate implementation plan using `/speckit.plan` command. Plan MUST
   pass Constitution Check gates before proceeding.

3. **Task Breakdown**: Create tasks.md using `/speckit.tasks` command. Group tasks by
   user story for independent implementation.

4. **Test-First Implementation**: For each task, write tests first, verify they fail,
   then implement. Use Red-Green-Refactor cycle.

5. **Code Review**: All PRs require:
   - Type hints/TypeScript verification
   - Test coverage report (minimum 80% for new code)
   - Performance check (bundle size, API response times)
   - Constitution compliance verification

6. **CI/CD Pipeline**:
   - Run all tests (pytest + vitest)
   - Type checking (mypy + TypeScript compiler)
   - Linting (Black, Prettier, ESLint)
   - Bundle size check
   - Deploy to preview environment (Vercel for frontend, AWS staging for backend)

7. **Deployment**: Production deploys MUST be approved by project lead. Use feature flags
   for gradual rollouts of risky features.

**Branch Strategy**: `main` branch for production. Feature branches: `###-feature-name`
where `###` is issue/spec number. No direct commits to main.

## Governance

This constitution supersedes all other development practices and guidelines:

- **Compliance**: All PRs MUST verify adherence to constitution principles. Reviewers
  MUST check Constitution Check gates from plan.md.
- **Violations**: Any deviation from principles requires explicit justification documented
  in PR description and reviewed by project lead.
- **Amendment Process**: Constitution changes require:
  1. Proposal with rationale
  2. Discussion with all active contributors
  3. Version bump (semantic versioning)
  4. Update all dependent templates and docs
  5. Communication to all team members
- **Versioning**: Follow semantic versioning for constitution:
  - MAJOR: Remove or redefine core principles
  - MINOR: Add new principles or sections
  - PATCH: Clarifications, wording improvements
- **Review Cadence**: Review constitution quarterly. Update based on team learnings and
  emerging patterns.
- **Complexity Justification**: Any code violating simplicity or performance principles
  MUST be documented in plan.md Complexity Tracking section with clear justification.

**Reference**: Use this constitution during `/speckit.plan` and `/speckit.tasks` command
execution to ensure all generated artifacts comply with project standards.

**Version**: 1.0.0 | **Ratified**: 2025-10-31 | **Last Amended**: 2025-10-31

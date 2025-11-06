# Frontend Tests Documentation

## Overview

This directory contains comprehensive tests for the HolisticMatch frontend authentication system.

- **E2E Flow Tests**: Complete user journey (register → verify → login → dashboard → edit → delete → logout)
- **Unit Tests**: Error handling, auth state, response validation
- **Integration Tests**: Component and service integration (future)

## Test Structure

```
tests/
├── setup.ts                          # Test environment setup
├── integration/
│   └── e2e-flow.test.ts             # End-to-end authentication flow
└── unit/
    ├── auth.test.ts                 # Auth hooks, services, error handling
    ├── components/                  # Component tests
    ├── hooks/                       # Hook tests
    ├── pages/                       # Page component tests
    └── services/                    # Service tests
```

## Running Tests

### Development

```bash
# Run all tests in watch mode
npm run test:watch

# Run specific test file
npm run test tests/integration/e2e-flow.test.ts

# Run with UI
npm run test:ui
```

### Coverage

```bash
# Generate coverage report
npm run test:coverage

# Coverage targets: 70% lines, functions, branches, statements
```

## Test Files

### E2E Flow Tests (`integration/e2e-flow.test.ts`)

**Purpose**: Validate complete authentication journey with real API calls

**Prerequisites**:
- Backend API must be running
- Database populated and ready
- Network connectivity

**Test Flow**:
```
1. Register new professional
2. Verify email with OTP
3. Login with credentials
4. Fetch profile
5. Update profile
6. List professionals (verify update)
7. Refresh token
8. Logout
9. Verify token invalidation
10. Delete account
11. Verify deletion
```

**Important Notes**:
- ⚠️ **REAL API CALLS** - Uses actual backend endpoints
- 🗑️ **Auto-cleanup** - Deletes test user after completion
- 🔒 **Unique emails** - Generates unique test emails per run (timestamp-based)
- ⏱️ **Timeout** - 10 second timeout per request

**Run E2E Tests**:
```bash
# Single run
npm run test tests/integration/e2e-flow.test.ts

# Watch mode (auto-rerun on changes)
npm run test:watch tests/integration/e2e-flow.test.ts

# Verbose output
npm run test -- tests/integration/e2e-flow.test.ts --reporter=verbose
```

**Expected Output**:
```
PASS  tests/integration/e2e-flow.test.ts (12.5s)
  E2E Auth Flow
    ✓ Step 1: Should register a new professional (245ms)
    ✓ Step 2: Should verify email with OTP (156ms)
    ✓ Step 3: Should login and get JWT tokens (189ms)
    ✓ Step 4: Should fetch current profile (134ms)
    ✓ Step 5: Should update profile (167ms)
    ✓ Step 6: Should list professionals (143ms)
    ✓ Step 7: Should refresh token (112ms)
    ✓ Step 8: Should logout (125ms)
    ✓ Step 9: Should reject logged-out token (98ms)
    ✓ Step 10: Should delete account (156ms)
    ✓ Step 11: Should verify deletion (134ms)
    ✓ Summary: All steps passed (1ms)

  ======================================================================
  ✅ E2E AUTH FLOW - ALL STEPS PASSED
  ======================================================================
```

### Auth Unit Tests (`unit/auth.test.ts`)

**Purpose**: Test error handling, auth state management, and response validation

**Sections**:

1. **Error Handler Tests** (`parseApiError`)
   - Network errors (offline, timeout)
   - HTTP 4xx errors (400, 401, 403, 404, 409, 429)
   - HTTP 5xx errors (500, 503)
   - Generic JavaScript errors
   - Edge cases (null data, missing fields)

2. **localStorage Tests**
   - Token storage and retrieval
   - Professional ID storage
   - Email verification flag
   - Complete token cleanup on logout
   - Partial cleanup scenarios

3. **Auth Response Format Tests**
   - Registration response structure
   - Login response with JWT tokens
   - Token refresh response
   - Field validation

**Run Unit Tests**:
```bash
# Run all unit tests
npm run test tests/unit/

# Run specific test
npm run test tests/unit/auth.test.ts

# Watch mode
npm run test:watch tests/unit/auth.test.ts
```

## Test Configuration

### Vitest Config (`vitest.config.ts`)

```typescript
{
  environment: 'jsdom',          // Browser-like environment
  globals: true,                 // Global test functions (describe, it, expect)
  setupFiles: './tests/setup.ts',// Test setup hooks
  coverage: {
    provider: 'v8',
    thresholds: {
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70,
    },
  },
}
```

### Setup File (`tests/setup.ts`)

- Configures testing libraries
- Sets up mocks if needed
- Initializes globals

## Best Practices

### Writing Tests

1. **Arrange-Act-Assert Pattern**
   ```typescript
   it('should do something', () => {
     // Arrange
     const testData = { ... }
     
     // Act
     const result = functionUnderTest(testData)
     
     // Assert
     expect(result).toBe(expected)
   })
   ```

2. **Use Descriptive Test Names**
   ```typescript
   ✅ it('should return user data when token is valid')
   ❌ it('should work')
   ```

3. **Test Behavior, Not Implementation**
   ```typescript
   ✅ expect(userEmail).toBe('test@example.com')
   ❌ expect(localStorage.getItem('email')).toBe('test@example.com')
   ```

### E2E Test Guidelines

1. **Use Unique Test Data**
   - Generate unique emails per test run
   - Use timestamps or UUIDs
   - Clean up after tests

2. **Handle Both Success and Failure**
   - Test happy path
   - Test error scenarios
   - Verify error messages

3. **Performance**
   - Tests should be fast (< 1s each)
   - E2E tests can be slower (5-30s)
   - Use appropriate timeouts

## Continuous Integration

### GitHub Actions

E2E tests should **NOT** run in CI/CD because:
- ❌ Requires live backend instance
- ❌ Database mutations
- ❌ Network-dependent
- ❌ Slow (30+ seconds per run)

**Recommended CI/CD approach**:
```yaml
# CI/CD runs unit tests only
npm run test tests/unit/

# E2E tests run manually in staging environment
npm run test tests/integration/e2e-flow.test.ts
```

## Troubleshooting

### Test Fails with "Network Error"

```
Error: Network Error
Response: undefined
```

**Solution**: Backend API is not running
```bash
cd backend
python manage.py runserver
```

### Test Fails with "401 Unauthorized"

```
Expected: 200
Received: 401
```

**Solution**: Token refresh failed, backend token expired or revoked
- Clear browser localStorage
- Backend tokens have expiration time

### Test Fails with "Email Already Exists"

```
Response Status: 409
Error: Email already registered
```

**Solution**: Test user email collision
- Timestamps generate unique emails, but collisions possible
- Manual test cleanup: Delete test user in Django admin

### Import Errors in Tests

```
Cannot find module '@/hooks/useAuth'
```

**Solution**: Update test setup or use full paths
```typescript
// Use relative paths in tests
import { useAuth } from '../src/hooks/useAuth'
```

## Performance Metrics

### Unit Tests
- Average duration: **< 1 second**
- Total: **< 5 seconds**

### E2E Tests
- Average per step: **100-250ms**
- Total flow: **10-15 seconds**
- Including setup/teardown: **15-20 seconds**

## Future Improvements

- [ ] Add component snapshot tests
- [ ] Add visual regression tests
- [ ] Add performance benchmarks
- [ ] Add accessibility (a11y) tests
- [ ] Add mock API server for E2E tests
- [ ] Integrate with CI/CD for unit tests only
- [ ] Add test reporting dashboard

## References

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Jest Matchers](https://vitest.dev/api/expect.html)

## Questions?

For test-related questions or issues:
1. Check test output for detailed error messages
2. Run tests in watch mode for debugging
3. Check test file comments for specific test documentation
4. Review backend API documentation for endpoint details

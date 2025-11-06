# 🔐 Test Credentials & Admin Access

## Frontend Login - Testing Credentials

### Test Professionals (Pre-seeded Database)

All professionals use the same password pattern: `senha123`

| Name | Email | Password | City | Services |
|------|-------|----------|------|----------|
| Maria Silva | maria.silva@email.com | senha123 | São Paulo, SP | Reiki, Meditação, Florais |
| João Santos | joao.santos@email.com | senha123 | Rio de Janeiro, RJ | Acupuntura, Massagem |
| Ana Costa | ana.costa@email.com | senha123 | Belo Horizonte, MG | Yoga, Meditação, Tai Chi |
| Carlos Oliveira | carlos.oliveira@email.com | senha123 | Curitiba, PR | Aromaterapia, Cristaloterapia, Reiki |
| Juliana Lima | juliana.lima@email.com | senha123 | Porto Alegre, RS | Massagem, Reflexologia, Aromaterapia |
| Patrícia Mendes | patricia.mendes@email.com | senha123 | Brasília, DF | Florais, Reiki, Meditação |

### Quick Test Flow

```
1. Go to: https://holisticmatch.vercel.app/login
2. Enter email: maria.silva@email.com
3. Password: senha123
4. Click "Entrar"
5. Should be redirected to /dashboard
6. Dashboard shows profile info, can edit profile, can logout
```

---

## Backend Admin Access

### Django Admin Panel

```
URL: http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/admin/
```

### Superuser Credentials

```
Username: admin
Password: holistic2025!@#
Email: admin@holisticmatch.local
```

### Admin Panel Features

1. **Users** → Manage user accounts
2. **Professionals** → View/edit professional profiles
3. **Services** → Manage service types
4. **Verify Email Status** → Check email verification

---

## Testing Scenarios

### Scenario 1: Login with Existing Account

```
✅ Go to Login page
✅ Use: maria.silva@email.com / senha123
✅ Should redirect to /dashboard
✅ Show profile info
✅ Show "Edit Profile" button
✅ Show "Logout" button
```

### Scenario 2: Register New Professional (BROKEN - FIX IN PROGRESS)

```
⚠️ Register page broken at Step 1
❌ "Próximo Passo" button doesn't work
❌ No API call being made

Issue: RegisterProfessionalPage.tsx line 204-207
- Only validates locally
- Doesn't submit to backend
- Should call professionalService.createProfessionalWithPassword()
```

### Scenario 3: Logout

```
✅ Click "Sair" in header
✅ Should clear tokens
✅ Should redirect to home
✅ Should remove auth from localStorage
```

### Scenario 4: Access Dashboard

```
✅ After login, click Dashboard link
✅ Should show profile info (3 tabs)
✅ Profile tab: Name, services, city
✅ Settings tab: Logout button
✅ Bookings tab: (empty for now)
```

---

## Known Issues

### 1. Registration Page Step 1 Not Submitting (CRITICAL)

**Status**: 🔴 **NEEDS FIX**

**Problem**: 
- Button says "Próximo Passo" but doesn't submit Step1 data to backend
- Only validates locally and changes component state
- User stuck on Step 1

**Location**: 
- File: `frontend/src/pages/RegisterProfessionalPage.tsx`
- Lines: 186-220 (handleStep1Submit function)

**Root Cause**:
```typescript
// Current code (WRONG):
const handleStep1Submit = async (e: React.FormEvent) => {
  // ... validation ...
  
  // ONLY updates local state, NO API call
  setCurrentStep(2)  // ← Just changes UI
}
```

**Expected**:
```typescript
// Should call:
await professionalService.createProfessionalWithPassword(...)
```

**Fix Required**: 
- [ ] Make Step1 submit call backend API
- [ ] Store step1 data in state for Step2
- [ ] OR make API call only at Step2 submit (current design)

---

## Email Verification

All test accounts are **already verified** in the database, so you can login directly without email verification.

If you need to test the email verification flow:
1. Use the registration form (after fix)
2. You'll be redirected to `/verify-email`
3. Backend test OTP is: `000000`

---

## Vercel Deployment

### Frontend URL
```
https://holisticmatch.vercel.app/
```

### Environment
```
API Base: /api (proxied to backend)
Backend: http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com
```

---

## Backend Endpoints (for testing)

### Public Endpoints

```
GET /api/v1/professionals/
- List all professionals (paginated)

GET /api/v1/professionals/{id}/
- Get professional by ID

GET /api/v1/professionals/service_types/
- Get available service types
```

### Auth Endpoints

```
POST /api/v1/auth/register/
POST /api/v1/auth/login/
POST /api/v1/auth/verify-email/
POST /api/v1/auth/refresh/
POST /api/v1/auth/logout/
```

### Protected Endpoints (requires JWT token)

```
GET /api/v1/professionals/me/
- Get current user's professional profile

PATCH /api/v1/professionals/{id}/
- Update professional profile

DELETE /api/v1/professionals/{id}/
- Delete professional account
```

---

## Browser Console Testing

### Check localStorage (F12 → Console)

```javascript
// View all stored auth data
localStorage.getItem('access_token')
localStorage.getItem('refresh_token')
localStorage.getItem('professional_id')

// Clear all auth (for manual logout testing)
localStorage.clear()
```

### Check Network (F12 → Network)

```
1. Open DevTools (F12)
2. Click "Network" tab
3. Perform action (login, register, etc.)
4. See API calls being made
5. Check response status (200, 201, 400, 401, etc.)
```

---

## Troubleshooting

### "Email already registered" on login attempt

**Solution**: Email is being used - all test emails are already in database
- Use one of the emails above
- Or clear database and re-seed

### Login page redirects to /verify-email

**Solution**: User account not verified
- All test accounts ARE verified
- If you registered new account, verify with OTP: `000000`

### "Cannot connect to API" error

**Solution**: Check backend is running
```bash
cd backend
python manage.py runserver
# Should show: Starting development server at http://127.0.0.1:8000/
```

### Logout button not visible

**Solution**: Not authenticated
- Use login page first
- Check localStorage for access_token

---

## Next Steps to Fix Registration

1. **Identify root cause** - Step1 submit doesn't call API ✅
2. **Fix Step1 submit** - Make it call backend or store data properly
3. **Test registration flow** - Create new account, verify, login
4. **Update CHANGELOG** - Document fix
5. **Redeploy to Vercel** - Push to main branch

---

**Status**: Registration broken, but login/logout working perfectly! 🎉

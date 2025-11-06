# 🔍 HOW TO DEBUG: Registration Form Not Submitting

## 5-Minute Diagnostic Guide

### Step 1: Open Browser DevTools (F12)

On https://holisticmatch.vercel.app/register:

```
Windows: F12 or Ctrl+Shift+I
Mac:     Cmd+Option+I
```

Should see panels:
- Console (messages/errors)
- Network (API calls)
- Elements (HTML)
- Sources (JavaScript debugging)

---

### Step 2: Try Registration (Watch Console)

1. **Go to**: https://holisticmatch.vercel.app/register

2. **Fill Step 1 Form**:
   ```
   Nome Completo: Test User
   Email: test12345@example.com
   Telefone: (11) 99999-9999
   CPF: 12345678901 (optional)
   Senha: Senha@2025
   Confirm Senha: Senha@2025
   Estado: SP
   Cidade: São Paulo
   ```

3. **Click**: "Próximo Passo" button

4. **Watch DevTools Console** - Look for:
   - ✅ "Dados validados com sucesso!"
   - ❌ Any red error messages
   - ❌ Any yellow warnings

---

### Step 3: Check Console Messages

#### If you see SUCCESS message:
```
"Dados validados com sucesso!"
"Prosseguindo para o próximo passo..."
```

Then the form IS submitting! The issue might be:
- [ ] UI not updating (React state issue)
- [ ] Step 2 form has an error
- [ ] Photo upload failing silently

**Next**: Go to Step 4B (Check Network)

#### If you see ERROR message:
```
Example: "TypeError: Cannot read property 'photo' of undefined"
Example: "validatePhoto is not a function"
Example: "sessionStorage is undefined"
```

**This is the bug!** Note the exact error and send it.

#### If you see NOTHING:
```
Console is empty or no red errors
```

Then:
- [ ] Form didn't submit (button issue)
- [ ] JavaScript errors swallowed
- [ ] Error happening elsewhere

**Next**: Go to Step 4A (Check Network)

---

### Step 4A: Check Network (API Calls)

1. **Open DevTools** → **Network tab**

2. **Clear**: Click trash icon to clear Network history

3. **Fill form** (from Step 2 above)

4. **Click**: "Próximo Passo"

5. **Check Network tab** - Look for:

```
POST /api/v1/auth/register/
POST /api/v1/professionals/
POST /api/v1/professionals/me/
```

**If you see API calls**: ✅ Form is submitting!
**If you see NO calls**: ❌ Form not submitting to backend

---

### Step 4B: Check React State

1. **Install React DevTools** (Chrome Extension)
   - https://chrome.google.com/webstore/detail/react-developer-tools

2. **Open DevTools** → **Components tab**

3. **Find** RegisterProfessionalPage component

4. **Check Hook Values**:
   - `currentStep` should be 1 initially
   - `step1Data` should have form values
   - `loading` should be false (unless submitting)

5. **Click** "Próximo Passo"

6. **Check again**:
   - `currentStep` should change to 2 ✅
   - `step2Data` should be ready
   - UI should show Step 2 form

---

### Step 5: Take Screenshots

Send these to diagnose:

1. **Console Tab** (after clicking button)
   - Right-click → Screenshot
   - Include any red errors

2. **Network Tab** (after clicking button)
   - Show if any POST requests appear
   - Show response status codes

3. **React Components Tab** (if installed)
   - Show RegisterProfessionalPage hooks
   - Show currentStep value

---

## Detailed Error Scenarios

### Scenario A: Form Won't Submit At All

**Symptoms**:
- Button doesn't respond to clicks
- No console errors
- No network requests

**Possible Causes**:
1. JavaScript disabled
2. Button not in form element
3. Event listener not attached
4. React component not rendering

**Test**:
```javascript
// In Console, type:
document.querySelector('button[type="submit"]')
// Should show button element

// Check if it's clickable
document.querySelector('button[type="submit"]').click()
// Should trigger form submission
```

---

### Scenario B: Validation Always Fails

**Symptoms**:
- Toast says "Por favor, corrija os erros"
- Can't get past Step 1
- Different errors each time

**Possible Causes**:
1. Email format validation too strict
2. Password requirements not met
3. Phone number format wrong
4. State/city not properly selected

**Check Validation Rules**:
```typescript
// In RegisterProfessionalPage.tsx, lines 108-128
// Email must be valid format
// Password must have: 8+ chars, special char
// Phone must match Brazilian format
```

**Test**:
```javascript
// In Console, type:
/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test('test@example.com')
// Should return: true
```

---

### Scenario C: sessionStorage Error

**Symptoms**:
- Console error mentioning "sessionStorage"
- Form seems to submit but then error appears

**Possible Causes**:
1. Browser in private mode (sessionStorage disabled)
2. sessionStorage quota exceeded
3. sessionStorage access denied

**Test**:
```javascript
// In Console, type:
sessionStorage.setItem('test', 'value')
// Should work or show error

// Check if available
typeof(Storage) !== "undefined"
// Should return: true
```

---

### Scenario D: Photo Upload Issue

**Symptoms**:
- Form submits to Step 2
- Step 2 submits successfully
- But then error appears about photo

**Possible Causes**:
1. Photo file too large (>5MB)
2. Photo not in correct format
3. Photo upload endpoint broken

**Test**:
```javascript
// In Console, type:
// Get first file input
const fileInput = document.querySelector('input[type="file"]')
// Check file
const file = fileInput.files[0]
// Check size
console.log(file.size) // Should be < 5242880 (5MB)
console.log(file.type) // Should be 'image/jpeg', 'image/png', etc.
```

---

## Copy-Paste Test Code

### Full Validation Test

```javascript
// Paste into Console, press Enter

// 1. Check form exists
const form = document.querySelector('form')
console.log('Form found:', form !== null)

// 2. Check button exists
const button = document.querySelector('button[type="submit"]')
console.log('Button found:', button !== null)
console.log('Button disabled:', button?.disabled)
console.log('Button text:', button?.textContent)

// 3. Check form inputs
const inputs = form?.querySelectorAll('input, select, textarea')
console.log('Number of inputs:', inputs?.length)
inputs?.forEach(input => {
  console.log(`${input.name || input.id}: ${input.value}`)
})

// 4. Check sessionStorage
console.log('SessionStorage available:', typeof(Storage) !== "undefined")

// 5. Try to submit
console.log('Attempting form submit...')
try {
  form?.requestSubmit()
  console.log('Form submit triggered successfully')
} catch(e) {
  console.error('Form submit failed:', e)
}

// 6. Check current React state (if React DevTools installed)
// Use Components tab to verify currentStep and step1Data
```

---

## Quick Fixes to Try

### Fix 1: Hard Refresh (Most Common)

```
Ctrl+Shift+R (Windows)
Cmd+Shift+R (Mac)
```

This clears browser cache and reloads JavaScript.

### Fix 2: Incognito Mode

```
Ctrl+Shift+N (Windows)
Cmd+Shift+N (Mac)
```

Tests if issue is from extensions or cookies.

### Fix 3: Different Browser

Try Chrome, Firefox, or Safari to see if browser-specific issue.

---

## When to Report Issue

Send this info when reporting:

1. **Exact steps to reproduce**:
   ```
   1. Go to [URL]
   2. Fill form with:
      - Name: [value]
      - Email: [value]
      - etc.
   3. Click button
   4. Error happens
   ```

2. **Console error** (copy/paste exact message):
   ```
   TypeError: Cannot read property 'X' of undefined
   at RegisterProfessionalPage.tsx:123
   ```

3. **Browser info**:
   ```
   Chrome Version: 120.0.6099.129
   OS: Windows 11 / Mac / Linux
   ```

4. **Screenshots**:
   - Console tab showing errors
   - Network tab showing requests
   - React DevTools showing state

---

## File Locations for Debugging

### Frontend Files to Check:

```
frontend/src/pages/RegisterProfessionalPage.tsx
├── Line 186-220: handleStep1Submit (form submit handler)
├── Line 150-180: validateStep1Form (validation logic)
├── Line 50-75: State initialization (step1Data, currentStep)
└── Line 458+: Form rendering (onSubmit binding)

frontend/src/hooks/useFormValidation.ts
├── validate() function (validation logic)
└── Error message generation

frontend/src/services/professionalService.ts
├── createProfessionalWithPassword (API call, only called at Step 2)
```

### Backend Endpoints:

```
POST /api/v1/professionals/
- Body: name, email, password, services, etc.
- Response: professional object + tokens

POST /api/v1/professionals/{id}/photo/
- Upload photo file
```

---

## Debug Checklist

```
Before reporting issue:

[ ] Hard refresh (Ctrl+Shift+R)
[ ] Clear browser cache
[ ] Try incognito mode
[ ] Check Console for errors
[ ] Check Network for requests
[ ] Verify all form fields filled
[ ] Test with Firefox/Chrome
[ ] Test on different computer
[ ] Disable browser extensions
[ ] Check React DevTools state
```

---

## Expected Behavior After Fix

1. ✅ Fill Step 1 form
2. ✅ Click "Próximo Passo"
3. ✅ Toast: "Dados validados com sucesso!"
4. ✅ UI switches to Step 2
5. ✅ Add services in Step 2
6. ✅ Click "Confirmar Cadastro"
7. ✅ API POST request sent
8. ✅ Loading spinner shows
9. ✅ Redirect to /verify-email
10. ✅ Email verification page shows

---

**Ready to debug? Open F12 and start testing!** 🚀

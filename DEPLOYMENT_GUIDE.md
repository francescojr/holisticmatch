# Quick Deployment Guide - City Fix

## 🚀 Deploy to Production (5 minutes)

### Step 1: Verify Everything Locally
```bash
cd backend

# Run all tests
pytest tests/test_professional_api.py -v

# Expected: 29 passed ✅
```

### Step 2: Run Verification Script
```bash
python verify_city_fix.py

# Expected: ALL VERIFICATIONS PASSED ✅
```

### Step 3: Commit & Push
```bash
cd ..  # Go to repo root

git add -A
git commit -m "Fix: UNIQUE constraint violation in city creation + populate all Brazilian states/cities

- Updated conftest.py to use get_or_create() pattern (prevents duplicates)
- Created migration 0006_populate_brazilian_cities.py (27 states, 70 cities)
- Fixed test fixture to properly handle city fixture loading
- All 29 tests passing ✅"

git push origin main
```

### Step 4: Deploy Backend
```bash
cd backend

eb deploy holisticmatch-env

# Wait 3-5 minutes for deployment...
# Check status: eb status
```

### Step 5: Verify Production
```bash
# SSH to production instance
eb ssh

# Check migrations applied
python manage.py migrate --list | grep professionals

# Should show:
#  [X] professionals.0006_populate_brazilian_cities

# Verify cities in database
python manage.py shell
>>> from professionals.models import City
>>> City.objects.count()
70  # Should be 70 cities
>>> City.objects.values('state').distinct().count()
27  # Should be 27 states
>>> City.objects.filter(state='SP').count()
7   # São Paulo should have 7 cities
```

### Step 6: Test Production Endpoints
```bash
# Test valid state
curl -X GET "https://api.holisticmatch.com/api/v1/professionals/cities/SP/"
# Response: 200 OK with city list

# Test invalid state  
curl -X GET "https://api.holisticmatch.com/api/v1/professionals/cities/ZZ/"
# Response: 400 Bad Request
```

## Rollback Plan (If Issues)

```bash
# If something goes wrong
cd backend
eb deploy holisticmatch-env --previous

# Or manually:
eb ssh
python manage.py migrate professionals 0005
exit
eb terminate
# Then redeploy previous working version
```

## Troubleshooting

### Problem: Tests failing with "City matching query does not exist"
**Solution:** Run migration
```bash
python manage.py migrate professionals
```

### Problem: "UNIQUE constraint failed" still appearing
**Solution:** Clear database and remigrate
```bash
python manage.py migrate professionals 0005
python manage.py migrate professionals
```

### Problem: Timeout during deployment
**Solution:** Check logs and retry
```bash
eb logs
eb deploy holisticmatch-env
```

## Monitoring Post-Deployment

### Check Application Logs
```bash
eb logs --all
```

### Monitor Errors
```bash
# Look for UNIQUE constraint errors
grep "UNIQUE constraint" logs

# Should find NONE
```

### Verify Professional Creation
```bash
# Create a test professional
POST /api/v1/professionals/
{
  "name": "Test Professional",
  "city": "São Paulo",
  "state": "SP",
  "services": ["Test Service"],
  "bio": "Test bio with enough characters for validation",
  "price_per_session": 100,
  "attendance_type": "ambos"
}

# Expected: 201 Created
```

## Success Indicators ✅

- [ ] `pytest` all tests pass (29/29)
- [ ] `verify_city_fix.py` shows all verifications pass
- [ ] Production deployment completes without errors
- [ ] City endpoints return proper responses
- [ ] No UNIQUE constraint errors in logs
- [ ] Can create professionals with any of the 70 cities
- [ ] City dropdown works on frontend

## Estimated Time

| Step | Time |
|------|------|
| Local testing | 2 min |
| Verification | 1 min |
| Git commit/push | 1 min |
| Backend deployment | 3-5 min |
| Production verification | 2 min |
| **Total** | **~10 min** |

---

**Status:** Ready to deploy  
**Risk Level:** Low (backward compatible, proper testing)  
**Rollback Time:** < 2 minutes

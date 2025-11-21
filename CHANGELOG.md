# 🎯 HolisticMatch - Changelog

**Last Updated**: November 20, 2025  
**Status**: ✅ PRODUCTION READY - 180/180 tests passing (6.73s)

---

## NOVEMBER 20, 2025 - CRITICAL FIXES: Moderation & Validation

### 🔴 CRITICAL BUG #1: ProfessionalCreateSerializer Validators Breaking Silently

**Problem:**
Users could register with offensive content in name/bio/services:
- "Piroca Gigantesca" as name - ACCEPTED (should be BLOCKED)
- "Caralho" as title - ACCEPTED (should be BLOCKED)
- Photos of intimate body parts - ACCEPTED (no moderation applied)

**Root Cause:**
Multiple validators in `ProfessionalCreateSerializer` used non-existent `e.message` attribute:
```python
except DjangoValidationError as e:
    raise serializers.ValidationError(e.message)  # ❌ AttributeError!
```

When exception occurred in error handler, it was silently swallowed → validation never happened.

**Fixed Files:**
- `backend/professionals/serializers.py` - Lines 315-377 (6 validators + validate() method)

**Solution:**
```python
# Proper error extraction with fallbacks
except DjangoValidationError as e:
    raise serializers.ValidationError(
        str(e) if hasattr(e, 'message') and e.message 
        else e.messages[0] if e.messages 
        else str(e)
    )
```

### 🔴 CRITICAL BUG #2: Image Moderation Not Applied to CREATE

**Problem:**
`validate_photo()` in `ProfessionalCreateSerializer` didn't call image moderation service.

**Fixed Files:**
- `backend/professionals/serializers.py` - Lines 328-343

**Solution:**
Added image moderation check:
```python
# Image moderation: check for explicit/violent content
image_moderation = get_image_moderation_service()
is_safe, moderation_result = image_moderation.moderate_professional_photo(value)

if not is_safe:
    error_msg = moderation_result.get('message', 'Foto contém conteúdo impróprio')
    raise serializers.ValidationError(error_msg)
```

### 📋 ENHANCEMENT: Enhanced Moderation Regex Patterns

**Problem:**
Offensive sexual terms were missing from regex patterns:
- "Piroca" (slang for male genitals)
- "pau", "rola", "teta", "bunda", etc.

**Fixed Files:**
- `backend/professionals/moderation.py` - Lines 17-42

**Added Patterns:**
```regex
# Sexual content - comprehensive
\b(sexo|pornô|porno|pornografia|buceta|pinto|peito|anal|oral|trepar|transar|p0rno|piroca|pir|pau|rola|teta|mama|cu|rabo|bumbum|bundao|bunda)\b

# Leetspeak variations
(?i)(c4r4lh0|c4ralh0|c4r4lho|k4r4lho|k@r@lho|p1r0c4|p1r0c@|p1r0k4)
```

### 📋 ENHANCEMENT: Image Moderation Configuration Warning

**Problem:**
Image moderation was silently failing open when AWS Rekognition not configured.

**Fixed Files:**
- `backend/professionals/image_moderation.py` - Lines 51-54

**Solution:**
Now logs warning when AWS not configured:
```
AWS Rekognition not enabled - image moderation skipped. Configure AWS_ACCESS_KEY_ID for production.
```

### ✅ Validation Test Results

**CREATE Endpoint Tests:**
```
Name with "Piroca": BLOCKED ✓
Name with "Caralho": BLOCKED ✓
Bio with "buceta": BLOCKED ✓
Bio with "merda": BLOCKED ✓
Valid data: ACCEPTED ✓
```

**UPDATE Endpoint Tests:**
```
Name with "Merda": BLOCKED ✓
Bio with "Caralho": BLOCKED ✓
Valid data: ACCEPTED ✓
```

**Full Test Suite:**
```
180/180 PASSING in 6.73s ✓
No regressions ✓
```

---

## Security Summary

### Before This Fix:
- ❌ User could register with "Piroca Gigantesca" as name
- ❌ User could register with "Caralho" as title  
- ❌ User could register with photos of intimate body parts
- ❌ Validators were breaking silently (AttributeError swallowed)

### After This Fix:
- ✅ All CREATE validators properly enforced
- ✅ All UPDATE validators properly enforced (from previous session)
- ✅ Image moderation applied to photo uploads
- ✅ Error messages properly extracted and returned
- ✅ 180/180 tests passing with no regressions

---

## Files Changed in This Session

1. `backend/professionals/serializers.py`
   - Fixed `validate_name()` in ProfessionalCreateSerializer
   - Fixed `validate_bio()` in ProfessionalCreateSerializer
   - Fixed `validate_services()` in ProfessionalCreateSerializer
   - Fixed `validate_state()` in ProfessionalCreateSerializer
   - Fixed `validate()` method in ProfessionalCreateSerializer
   - Enhanced `validate_photo()` to include image moderation

2. `backend/professionals/moderation.py`
   - Enhanced PROHIBITED_PATTERNS regex with missing sexual terms
   - Added leetspeakvariation patterns

3. `backend/professionals/image_moderation.py`
   - Changed fail-open behavior to log warnings instead of silent failures

---

## Deployment Notes

**Prerequisites for Production:**
- Set `AWS_ACCESS_KEY_ID` environment variable for AWS Rekognition (image moderation)
- Set `OPENAI_API_KEY` for AI-based moderation (optional, regex fallback works)
- All validators now properly block offensive content

**Testing:**
```bash
cd backend
python -m pytest tests/ -q
# Expected: 180 passed, 1 warning in ~6-7s
```

**Git Status:**
All changes ready for deployment. No database migrations needed.

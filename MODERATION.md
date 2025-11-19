# Content Moderation Documentation

## Overview

HolisticMatch uses OpenAI's Moderation API to prevent users from registering or updating profiles with inappropriate, hateful, or illegal content. This feature automatically validates all user-generated text before saving to the database.

## Setup

### 1. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Go to Settings → API Keys
4. Create a new API key
5. Copy the key (format: `sk-...`)

**Cost**: The Moderation API is **completely free** to use

### 2. Configure Environment Variable

Add to your `.env` file:

```bash
OPENAI_API_KEY=sk-your-api-key-here
```

Or in production (e.g., AWS Elastic Beanstalk):

```
OPENAI_API_KEY: sk-your-api-key-here
```

### 3. Install Dependencies

```bash
pip install openai>=1.3.0
# Or if using requirements.txt:
pip install -r requirements.txt
```

## What Gets Moderated

The following fields are automatically checked for inappropriate content:

- **name** - Professional's name
- **bio** - Professional's biography/description
- **professional_title** - Professional title (e.g., "Certified Massage Therapist")

## What Gets Flagged

The OpenAI Moderation API detects and flags:

- 🚫 **Hate Speech** - Discriminatory language targeting groups
- 🚫 **Harassment** - Bullying, threats, intimidation
- 🚫 **Violence** - Graphic violence or threats of violence
- 🚫 **Sexual Content** - Inappropriate sexual material (including minors)
- 🚫 **Self-Harm** - Content promoting self-injury
- 🚫 **Offensive Language** - Profanity and offensive terms

## API Behavior

### Registration Flow

```
User submits registration
         ↓
Backend validates basic fields (email, password, etc.)
         ↓
Moderation service checks text fields
         ↓
✅ All safe → User created, verification email sent
❌ Any flagged → 400 Bad Request with error message
```

### Profile Update Flow

```
User submits profile update via PUT/PATCH
         ↓
Moderation service checks modified text fields
         ↓
✅ All safe → Profile updated
❌ Any flagged → 400 Bad Request with error message
```

## Error Response Example

If content is flagged during registration:

```json
{
  "name": "Conteúdo impróprio detectado. Por favor, revise o texto.",
  "bio": "Conteúdo impróprio detectado. Por favor, revise o texto."
}
```

HTTP Status: `400 Bad Request`

## Disabling Moderation

If you want to disable content moderation temporarily:

```bash
# Don't set OPENAI_API_KEY in your environment
# Or set it to empty string
OPENAI_API_KEY=
```

The system will gracefully degrade - all content will be allowed and logged as disabled.

## Testing

Run the moderation test suite:

```bash
python -m pytest backend/tests/unit/test_moderation.py -v
```

Test a specific scenario:

```bash
# Test safe content
python -m pytest backend/tests/unit/test_moderation.py::TestModerationService::test_moderate_text_safe_content -v

# Test flagged content
python -m pytest backend/tests/unit/test_moderation.py::TestModerationService::test_moderate_text_flagged_content -v
```

## Implementation Details

### Service Architecture

**File**: `backend/professionals/moderation.py`

```python
from professionals.moderation import get_moderation_service

# Get singleton instance
moderation = get_moderation_service()

# Moderate single text
is_safe, results = moderation.moderate_text("user input")

# Moderate professional data (name, bio, title)
is_safe, results = moderation.moderate_professional_data(professional_dict)
```

### Integration Points

1. **Registration**: `ProfessionalCreateSerializer.validate()`
2. **Profile Update**: `ProfessionalSerializer.validate()`

Both automatically check content and reject if flagged.

### Return Values

```python
# moderate_text returns:
(is_safe: bool, results: dict)

results = {
    'flagged': bool,           # Overall flag status
    'categories': {            # Per-category flags
        'hate': bool,
        'harassment': bool,
        'violence': bool,
        'sexual': bool,
        'sexual_minors': bool,
        'self_harm': bool,
        # ... other categories
    },
    'category_scores': {       # Confidence scores 0.0-1.0
        'hate': 0.95,
        'harassment': 0.12,
        # ...
    }
}
```

## Privacy & Security

- ✅ Only text fields are sent to OpenAI
- ✅ No user IDs, emails, or personal data sent
- ✅ No moderation results exposed to frontend
- ✅ All moderation checks happen server-side
- ✅ Fails safely (allows content if API is down)

## Production Considerations

### Monitoring

Monitor API usage in your OpenAI dashboard:
- Dashboard: https://platform.openai.com/account/usage/summary
- Moderation API is included in free tier

### Rate Limiting

OpenAI doesn't rate limit the Moderation API for free tier users. No additional configuration needed.

### Costs

**Moderation API**: 100% FREE

No charges incurred regardless of usage volume.

## Troubleshooting

### Moderation not working?

Check logs:
```bash
tail -f backend/logs/django.log | grep moderation
```

### Error: "OPENAI_API_KEY not configured"

This is a warning, not an error. Add the key to `.env`:
```bash
OPENAI_API_KEY=sk-your-key
```

### Test content still passes?

OpenAI's moderation API requires very egregious content. Test with actual offensive language rather than generic placeholders.

## API Reference

### ModerationService

```python
class ModerationService:
    def moderate_text(self, text: str) -> Tuple[bool, Dict]
    """Moderate a single text string"""
    
    def moderate_professional_data(self, data: Dict) -> Tuple[bool, Dict]
    """Moderate all text fields in professional data"""
```

### Functions

```python
def get_moderation_service() -> ModerationService
"""Get or create the moderation service singleton"""
```

## Examples

### Example 1: Safe Content

```python
text = "I provide meditation and breathing exercises for stress relief"
is_safe, results = moderation.moderate_text(text)
# Returns: (True, {'flagged': False, ...})
# Result: ✅ Passes, user can register
```

### Example 2: Flagged Content

```python
text = "[contains hate speech]"
is_safe, results = moderation.moderate_text(text)
# Returns: (False, {'flagged': True, 'categories': {'hate': True}, ...})
# Result: ❌ Blocked, registration fails with error message
```

### Example 3: Professional Data

```python
data = {
    'name': 'John Smith',
    'bio': 'Professional therapist with 10 years experience',
    'professional_title': 'Licensed Massage Therapist'
}
is_safe, results = moderation.moderate_professional_data(data)
# Returns: (True, {...})
# Result: ✅ All fields safe, profile saved
```

## Further Reading

- [OpenAI Moderation API Docs](https://platform.openai.com/docs/guides/moderation)
- [OpenAI Safety Documentation](https://platform.openai.com/docs/guides/safety-best-practices)

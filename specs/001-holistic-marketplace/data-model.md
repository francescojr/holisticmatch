# Data Model: HolisticMatch Marketplace Platform

**Feature**: 001-holistic-marketplace  
**Phase**: 1 - Design & Contracts  
**Date**: 2025-10-31

## Overview

This document defines the database schema, relationships, validation rules, and state transitions for the HolisticMatch marketplace platform. The data model supports professional profiles, authentication, and search/filtering functionality.

## Entity Relationship Diagram

```
┌─────────────┐
│    User     │ (Django Auth)
│─────────────│
│ id          │ PK
│ email       │ UNIQUE
│ password    │ (hashed)
└──────┬──────┘
       │ 1:1
       │
┌──────▼──────────────┐
│   Professional      │
│─────────────────────│
│ id                  │ PK
│ user_id             │ FK → User (UNIQUE)
│ full_name           │
│ photo_url           │
│ bio                 │ (max 500 chars)
│ services            │ JSON Array
│ price_per_session   │ Decimal
│ attendance_type     │ ENUM
│ city                │
│ neighborhood        │
│ whatsapp            │
│ instagram           │ (optional)
│ email               │
│ is_active           │ Boolean
│ created_at          │ Timestamp
│ updated_at          │ Timestamp
└─────────────────────┘
```

## Entities

### User (Django Built-in)

**Purpose**: Authentication credentials for professionals

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | PK, Auto-increment | Unique identifier |
| email | VARCHAR(254) | UNIQUE, NOT NULL | Login credential |
| password | VARCHAR(128) | NOT NULL | Hashed (PBKDF2) |
| is_active | Boolean | DEFAULT TRUE | Account enabled status |
| is_staff | Boolean | DEFAULT FALSE | Admin access |
| is_superuser | Boolean | DEFAULT FALSE | Full admin access |
| date_joined | Timestamp | DEFAULT NOW | Account creation time |
| last_login | Timestamp | NULLABLE | Last successful login |

**Validation Rules**:
- Email format: RFC 5322 compliant
- Password: 8+ characters, at least one letter and one number (enforced in serializer)
- Email uniqueness enforced at database level

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `email`

**Notes**:
- Uses Django's AbstractBaseUser model
- Passwords hashed with PBKDF2-SHA256 (Django default)
- No additional custom fields needed for MVP

---

### Professional

**Purpose**: Holistic therapy service provider profile

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | PK, Auto-increment | Unique identifier |
| user_id | Integer | FK → User, UNIQUE, NOT NULL, ON DELETE CASCADE | Associated auth account |
| full_name | VARCHAR(200) | NOT NULL | Display name |
| photo_url | VARCHAR(500) | NOT NULL | S3 URL to profile photo |
| bio | TEXT | NOT NULL, max 500 chars | Professional description |
| services | JSONB | NOT NULL, DEFAULT [] | Array of service types |
| price_per_session | DECIMAL(6,2) | NOT NULL, CHECK >= 50 AND <= 500 | Price in R$ |
| attendance_type | VARCHAR(10) | NOT NULL, CHECK IN ('home', 'office', 'both') | Service location |
| city | VARCHAR(100) | NOT NULL | City name |
| neighborhood | VARCHAR(100) | NOT NULL | Neighborhood/district |
| whatsapp | VARCHAR(20) | NOT NULL, CHECK starts with +55 | Contact number |
| instagram | VARCHAR(100) | NULLABLE | Instagram handle (without @) |
| email | VARCHAR(254) | NOT NULL | Contact email |
| is_active | Boolean | DEFAULT TRUE, NOT NULL | Profile visibility |
| created_at | Timestamp | DEFAULT NOW, NOT NULL | Profile creation time |
| updated_at | Timestamp | DEFAULT NOW, NOT NULL | Last modification time |

**Validation Rules**:
- `full_name`: 2-200 characters, no special characters except spaces, hyphens, apostrophes
- `photo_url`: Valid URL format, must be S3 URL (checked in application layer)
- `bio`: 10-500 characters
- `services`: Non-empty JSON array, each element must match predefined service types
- `price_per_session`: 50.00 ≤ price ≤ 500.00
- `attendance_type`: One of: `home`, `office`, `both`
- `city`: 2-100 characters
- `neighborhood`: 2-100 characters
- `whatsapp`: Format `+5511999999999` (11 digits after +55)
- `instagram`: 1-100 characters, alphanumeric + underscores only (if provided)
- `email`: RFC 5322 compliant

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `user_id`
- COMPOSITE INDEX on `(city, is_active)` for search queries
- INDEX on `price_per_session` for price filtering
- INDEX on `created_at` for sorting

**Constraints**:
```sql
-- Check price range
ALTER TABLE professionals 
ADD CONSTRAINT price_range 
CHECK (price_per_session >= 50.00 AND price_per_session <= 500.00);

-- Check attendance type
ALTER TABLE professionals 
ADD CONSTRAINT valid_attendance_type 
CHECK (attendance_type IN ('home', 'office', 'both'));

-- WhatsApp format (basic check, detailed validation in app layer)
ALTER TABLE professionals 
ADD CONSTRAINT whatsapp_format 
CHECK (whatsapp LIKE '+55%');
```

**State Transitions**:
```
[Created] → is_active=TRUE (default)
     ↓
[Active] ⇄ [Inactive]
     ↓         ↓
  (deactivated by professional)
```

**State Rules**:
- Newly created profiles are active by default
- Professionals can toggle `is_active` status
- Inactive profiles excluded from search results but data retained
- Only active professionals can edit profiles (application-level check)

---

### Service Types (Enumeration)

**Purpose**: Predefined list of holistic therapy services

**Storage**: Application-level constant (not a database table for MVP)

**Values**:
```python
SERVICE_TYPES = [
    'Reiki',
    'Acupuntura',
    'Aromaterapia',
    'Massagem',
    'Meditação Guiada',
    'Tai Chi',
    'Reflexologia',
    'Cristaloterapia',
    'Florais',
    'Yoga',
    'Pilates Holístico',
]
```

**Rationale**: Fixed list for MVP simplifies filtering logic. No need for separate table with JOINs. Services stored as JSON array in Professional.services field.

**Future Enhancement**: If service types become dynamic (user-defined), migrate to separate `ServiceType` table with many-to-many relationship via junction table.

---

## Relationships

### User ↔ Professional (One-to-One)

**Type**: One-to-One, Mandatory

**Foreign Key**: `Professional.user_id → User.id`

**On Delete**: CASCADE (deleting user deletes professional profile)

**Rationale**: 
- Every professional has exactly one user account
- Every user (in this system) is a professional (no separate client accounts)
- Cascade delete ensures referential integrity

**Access Pattern**: 
- Most queries access professional data: `SELECT * FROM professionals WHERE ...`
- Use `select_related('user')` in Django to avoid N+1 queries when needing user email

---

## Query Patterns

### Search Professionals (Most Common)

**Use Case**: Client searches for professionals with filters

**Query**:
```sql
SELECT id, full_name, photo_url, services, price_per_session, 
       city, neighborhood, attendance_type, whatsapp, instagram, email
FROM professionals
WHERE is_active = TRUE
  AND city ILIKE '%São Paulo%'
  AND price_per_session <= 200.00
  AND services @> '["Reiki"]'::jsonb
  AND (attendance_type = 'home' OR attendance_type = 'both')
ORDER BY created_at DESC
LIMIT 12 OFFSET 0;
```

**Indexes Used**:
- `(city, is_active)` composite index for WHERE clause
- `price_per_session` index for price filter
- JSONB GIN index on `services` for containment operator (@>)

**Performance Target**: <100ms for typical result set (<100 matching professionals)

---

### Get Professional Detail

**Use Case**: Client clicks on professional card to view full profile

**Query**:
```sql
SELECT p.*, u.email as user_email
FROM professionals p
INNER JOIN auth_user u ON p.user_id = u.id
WHERE p.id = 123 AND p.is_active = TRUE;
```

**Indexes Used**:
- PRIMARY KEY on `professionals.id` (single row lookup)

**Performance Target**: <50ms

---

### Professional Dashboard (Own Profile)

**Use Case**: Authenticated professional views/edits their profile

**Query**:
```sql
SELECT * FROM professionals
WHERE user_id = 456;
```

**Indexes Used**:
- UNIQUE INDEX on `user_id` (single row lookup)

**Performance Target**: <50ms

---

## Data Integrity Rules

### Application-Level Validation

**Django Model Validation**:
- Use model `clean()` methods for complex validation
- Use serializer validation for API input
- Validate service types against predefined list
- Ensure WhatsApp number format with regex
- Check photo URL is from allowed S3 bucket

**Example**:
```python
def clean(self):
    # Validate services are from allowed list
    invalid_services = set(self.services) - set(SERVICE_TYPES)
    if invalid_services:
        raise ValidationError(f"Invalid services: {invalid_services}")
    
    # Validate WhatsApp format
    if not re.match(r'^\+55\d{11}$', self.whatsapp):
        raise ValidationError("WhatsApp must be in format +5511999999999")
```

### Database-Level Constraints

**Enforced via PostgreSQL**:
- NOT NULL constraints on required fields
- UNIQUE constraints on `User.email`, `Professional.user_id`
- CHECK constraints on price range, attendance type
- Foreign key constraint with CASCADE delete
- JSONB type enforces valid JSON structure

---

## Migration Strategy

### Initial Schema (Migration 0001_initial)

**Django Migration**:
```python
# professionals/migrations/0001_initial.py
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    initial = True
    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]
    
    operations = [
        migrations.CreateModel(
            name='Professional',
            fields=[
                ('id', models.BigAutoField(primary_key=True)),
                ('full_name', models.CharField(max_length=200)),
                ('photo_url', models.URLField(max_length=500)),
                ('bio', models.TextField(max_length=500)),
                ('services', models.JSONField(default=list)),
                ('price_per_session', models.DecimalField(max_digits=6, decimal_places=2)),
                ('attendance_type', models.CharField(max_length=10, choices=[...])),
                ('city', models.CharField(max_length=100)),
                ('neighborhood', models.CharField(max_length=100)),
                ('whatsapp', models.CharField(max_length=20)),
                ('instagram', models.CharField(max_length=100, null=True, blank=True)),
                ('email', models.EmailField()),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    to='auth.user'
                )),
            ],
            options={
                'db_table': 'professionals',
                'indexes': [
                    models.Index(fields=['city', 'is_active'], name='prof_city_active_idx'),
                    models.Index(fields=['price_per_session'], name='prof_price_idx'),
                    models.Index(fields=['created_at'], name='prof_created_idx'),
                ],
            },
        ),
    ]
```

### Adding JSONB GIN Index (Migration 0002_add_services_index)

**SQL Migration**:
```python
# professionals/migrations/0002_add_services_index.py
from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ('professionals', '0001_initial'),
    ]
    
    operations = [
        migrations.RunSQL(
            sql="CREATE INDEX prof_services_gin_idx ON professionals USING GIN (services);",
            reverse_sql="DROP INDEX prof_services_gin_idx;"
        ),
    ]
```

**Rationale**: GIN index enables fast containment queries (`services @> '["Reiki"]'`) for service type filtering.

---

## Seed Data

### Development Seed Data

**Purpose**: Populate database with sample professionals for testing search/filter

**Script**: `professionals/management/commands/seed_professionals.py`

**Data**:
- 50 professionals across major Brazilian cities (São Paulo, Rio de Janeiro, Belo Horizonte, etc.)
- Varied services (each professional offers 1-3 services)
- Price range: R$50-500 (distributed evenly)
- Mix of attendance types: 30% home, 30% office, 40% both
- All with valid photos (placeholder images from Lorem Picsum)

**Usage**:
```bash
python manage.py seed_professionals --count=50
```

---

## Data Lifecycle

### Professional Creation Flow

1. User registers via `/api/v1/auth/register/`
2. Backend creates `User` record (hashed password)
3. Backend creates `Professional` record (user_id FK)
4. Photo uploaded to S3, URL stored in `photo_url`
5. Professional record set to `is_active=TRUE` by default
6. Return JWT tokens + professional_id

### Professional Update Flow

1. Authenticated professional accesses dashboard
2. Modifies profile fields
3. If photo changed: upload new to S3, delete old, update `photo_url`
4. Update `updated_at` timestamp automatically (Django `auto_now`)
5. Changes visible in search results immediately (no caching)

### Professional Deactivation Flow

1. Professional sets `is_active=FALSE` via dashboard
2. Profile excluded from search results (WHERE clause filter)
3. Profile data retained (soft delete, not deleted from database)
4. Professional can reactivate at any time by setting `is_active=TRUE`

### Account Deletion Flow

1. Professional requests account deletion (future feature, not MVP)
2. Delete professional's photo from S3
3. Delete `Professional` record
4. CASCADE delete on `User` record (FK constraint)
5. JWT tokens blacklisted

---

## Performance Considerations

### Index Usage

**Query**: `WHERE city = 'São Paulo' AND is_active = TRUE`
- Uses composite index `(city, is_active)` (left-prefix rule)

**Query**: `WHERE price_per_session <= 200`
- Uses index on `price_per_session`

**Query**: `WHERE services @> '["Reiki"]'`
- Uses GIN index on `services` JSONB column

### Pagination Performance

**Offset-based pagination** (MVP):
- Fast for early pages (offset=0, 12, 24)
- Slower for deep pages (offset=1000+)
- Acceptable for <10k professionals

**Future**: Cursor-based pagination if dataset grows >10k

### N+1 Query Prevention

**Pattern**: Use `select_related('user')` when fetching professionals
```python
professionals = Professional.objects.filter(is_active=True).select_related('user')
```

**Rationale**: Avoids separate query for each professional's user record

---

## Security Considerations

### Row-Level Security (Supabase)

**Policy**: Professionals can only update their own profile

```sql
-- Enable RLS
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active professionals
CREATE POLICY "Public read active profiles"
ON professionals FOR SELECT
USING (is_active = TRUE);

-- Policy: Professionals can update own profile
CREATE POLICY "Update own profile"
ON professionals FOR UPDATE
USING (user_id = auth.uid());

-- Policy: Only authenticated users can insert
CREATE POLICY "Insert own profile"
ON professionals FOR INSERT
WITH CHECK (user_id = auth.uid());
```

**Note**: `auth.uid()` is Supabase's way of getting current authenticated user. May need adapter for JWT token integration.

### Sensitive Data

**Protected Fields**:
- User password (hashed, never returned in API)
- User email (not exposed in public search results, only in authenticated profile view)

**Public Fields**:
- All Professional fields except `user_id` (implementation detail)

---

## Backup & Recovery

### Backup Strategy (Supabase)

- Automatic daily backups (Supabase managed)
- Point-in-time recovery (PITR) available for 7 days
- Manual backup before major migrations: `pg_dump`

### Disaster Recovery

- RTO (Recovery Time Objective): 1 hour
- RPO (Recovery Point Objective): 1 hour (PITR granularity)
- Restoration process documented in ops runbook

---

## Future Enhancements (Out of Scope for MVP)

1. **Location Geocoding**: Add `latitude`, `longitude` fields for distance-based search
2. **Service Types Table**: Migrate from JSON array to many-to-many relationship if services become dynamic
3. **Professional Certifications**: Add table for professional credentials/certifications
4. **Reviews & Ratings**: Add `Review` entity with star rating and text feedback
5. **Availability Calendar**: Add table for professional availability schedule
6. **Service Packages**: Support multiple pricing tiers (single session, 5-pack, 10-pack)
7. **Soft Delete with Audit Trail**: Add `deleted_at` field and audit log table

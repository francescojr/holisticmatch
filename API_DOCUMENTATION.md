# HolisticMatch Professional API - Complete Documentation

**API Version**: v1.0.0  
**Base URL**: `/api/v1/`  
**Status**: ✅ Production Ready  
**Last Updated**: 2025-11-07

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Response Format](#response-format)
4. [Error Handling](#error-handling)
5. [Professional Endpoints](#professional-endpoints)
6. [Authentication Endpoints](#authentication-endpoints)
7. [Email Verification](#email-verification)
8. [Data Models](#data-models)
9. [Validation Rules](#validation-rules)
10. [Examples](#examples)

---

## 📖 Overview

HolisticMatch Professional API provides REST endpoints for:
- 👤 Professional registration and profile management
- 🔐 JWT-based authentication with email verification
- 🔍 Professional discovery with filtering
- 📸 Photo upload and management

### Key Features

✅ JWT Authentication with refresh tokens  
✅ Email verification (mandatory before login)  
✅ Complete CRUD operations for professionals  
✅ Service filtering and location-based search  
✅ Photo upload with S3 storage  
✅ Comprehensive error handling  
✅ Type-safe responses

---

## 🔐 Authentication

### JWT Token Structure

The API uses **JWT (JSON Web Token)** authentication with two token types:

- **Access Token**: Short-lived (15 minutes), used for API requests
- **Refresh Token**: Long-lived (24 hours), used to obtain new access tokens

### Authentication Header

```
Authorization: Bearer <access_token>
```

### Token Storage (Frontend)

Tokens are stored in browser's `localStorage`:
```javascript
localStorage.setItem('access_token', token)
localStorage.setItem('refresh_token', token)
```

---

## 📨 Registration & Email Verification Flow

### 1️⃣ Step 1: Register Professional

**POST** `/api/v1/auth/register/`

Register a new professional account.

**Request** (multipart/form-data):
```
email: "professional@example.com"
password: "SecurePassword@123"
name: "João Silva"
bio: "Holistic therapist with 10+ years experience..."
services: ["Yoga", "Meditação Guiada"]
price_per_session: 150.00
attendance_type: "presencial"
city: "São Paulo"
state: "SP"
neighborhood: "Vila Mariana"
whatsapp: "11999999999"
photo: <image_file>
```

**Success Response** (201 Created):
```json
{
  "message": "Professional registered successfully",
  "professional": {
    "id": 42,
    "email": "professional@example.com",
    "name": "João Silva",
    "city": "São Paulo",
    "state": "SP"
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user_id": 42,
  "professional_id": 42
}
```

**Important**: 
- ⚠️ Tokens are returned but user is still inactive (`is_active=False`)
- 📧 Email verification is **REQUIRED** before login
- 📬 Verification email sent automatically

---

### 2️⃣ Step 2: Verify Email

**GET** `/api/v1/auth/verify-email/{token}/`

Verify email using token from verification email link.

**Success Response** (200):
```json
{
  "message": "Email verified successfully",
  "user": {
    "id": 42,
    "email": "professional@example.com",
    "is_active": true
  }
}
```

**Error Response** (400 - Invalid/Expired token):
```json
{
  "detail": "Invalid or expired verification token"
}
```

**Frontend Integration**:
```javascript
// After verification, email is stored in localStorage for login page
localStorage.setItem('verification_email', 'professional@example.com')
localStorage.setItem('just_verified_email', 'professional@example.com')

// Then redirect to login page
navigate('/login')
```

---

## 🔑 Authentication Endpoints

### Login

**POST** `/api/v1/auth/login/`

Authenticate with email and password.

**Request**:
```json
{
  "email": "professional@example.com",
  "password": "SecurePassword@123"
}
```

**Success Response** (200):
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 42,
    "email": "professional@example.com",
    "username": "professional@example.com"
  }
}
```

**Error Response** (403 - Email not verified):
```json
{
  "detail": "Por favor, verifique seu email antes de fazer login"
}
```

**Error Response** (401 - Invalid credentials):
```json
{
  "detail": "Email ou senha inválidos"
}
```

---

### Get Current User Profile

**GET** `/api/v1/auth/me/`

Retrieve authenticated user and professional profile data.

**Headers**:
```
Authorization: Bearer <access_token>
```

**Success Response** (200):
```json
{
  "id": 42,
  "email": "professional@example.com",
  "professional_id": 42,
  "full_name": "João Silva",
  "city": "São Paulo",
  "state": "SP",
  "photo": "https://s3.amazonaws.com/holisticmatch/photos/profile_42.jpg",
  "bio": "Holistic therapist with 10+ years experience...",
  "whatsapp": "11999999999"
}
```

**Error Response** (401 - Unauthorized):
```json
{
  "detail": "Authentication credentials were not provided."
}
```

**Error Response** (404 - Professional profile not found):
```json
{
  "detail": "Professional profile not found"
}
```

---

### Refresh Access Token

**POST** `/api/v1/auth/refresh/`

Obtain a new access token using refresh token.

**Request**:
```json
{
  "refresh": "<refresh_token>"
}
```

**Success Response** (200):
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Error Response** (401 - Invalid/Expired token):
```json
{
  "detail": "Token is invalid or expired"
}
```

---

### Logout

**POST** `/api/v1/auth/logout/`

Revoke refresh token and logout user.

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request**:
```json
{
  "refresh_token": "<refresh_token>"
}
```

**Success Response** (200):
```json
{
  "detail": "Logout successful"
}
```

---

## 👤 Professional Endpoints

### List All Professionals

**GET** `/api/v1/professionals/`

Retrieve paginated list of all professionals.

**Query Parameters**:
```
?page=1
&page_size=10
&search=yoga
&service=Yoga
&city=São Paulo
&state=SP
&ordering=-created_at
```

**Success Response** (200):
```json
{
  "count": 156,
  "next": "/api/v1/professionals/?page=2",
  "previous": null,
  "results": [
    {
      "id": 42,
      "name": "João Silva",
      "email": "joao@example.com",
      "services": ["Yoga", "Meditação Guiada"],
      "price_per_session": 150.00,
      "attendance_type": "presencial",
      "city": "São Paulo",
      "state": "SP",
      "photo": "https://s3.amazonaws.com/holisticmatch/photos/profile_42.jpg",
      "bio": "...",
      "whatsapp": "11999999999",
      "created_at": "2025-11-07T10:30:00Z"
    }
  ]
}
```

---

### Get Professional Details

**GET** `/api/v1/professionals/{id}/`

Retrieve details of a specific professional.

**Success Response** (200):
```json
{
  "id": 42,
  "name": "João Silva",
  "email": "joao@example.com",
  "services": ["Yoga", "Meditação Guiada"],
  "price_per_session": 150.00,
  "attendance_type": "presencial",
  "city": "São Paulo",
  "state": "SP",
  "neighborhood": "Vila Mariana",
  "photo": "https://s3.amazonaws.com/holisticmatch/photos/profile_42.jpg",
  "bio": "Holistic therapist with 10+ years experience...",
  "whatsapp": "11999999999",
  "created_at": "2025-11-07T10:30:00Z"
}
```

**Error Response** (404):
```json
{
  "detail": "Not found."
}
```

---

### Update Professional Profile

**PATCH** `/api/v1/professionals/{id}/`

Update professional profile (only owner can update).

**Headers**:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request**:
```json
{
  "bio": "Updated bio...",
  "price_per_session": 200.00,
  "services": ["Yoga", "Pilates Holístico"]
}
```

**Success Response** (200):
```json
{
  "id": 42,
  "name": "João Silva",
  "bio": "Updated bio...",
  "price_per_session": 200.00,
  "services": ["Yoga", "Pilates Holístico"],
  "updated_at": "2025-11-07T11:45:00Z"
}
```

**Error Response** (403 - Not owner):
```json
{
  "detail": "You do not have permission to perform this action."
}
```

---

### Delete Professional Profile

**DELETE** `/api/v1/professionals/{id}/`

Delete professional profile (only owner can delete).

**Headers**:
```
Authorization: Bearer <access_token>
```

**Success Response** (204 No Content):
```
(empty body)
```

---

## 📤 Upload Professional Photo

**POST** `/api/v1/professionals/{id}/upload-photo/`

Upload or update professional profile photo.

**Headers**:
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Form Data**:
```
photo: <image_file>  # JPG, PNG, WebP (max 5MB)
```

**Success Response** (200):
```json
{
  "photo": "https://s3.amazonaws.com/holisticmatch/photos/profile_42.jpg"
}
```

**Error Response** (400 - Invalid file):
```json
{
  "photo": ["Invalid image file"]
}
```

---

## 📋 Data Models

### Professional

```json
{
  "id": "integer (primary key)",
  "name": "string (max 255)",
  "email": "email",
  "bio": "string (min 50 chars)",
  "services": "array of strings",
  "price_per_session": "decimal (2 decimal places)",
  "attendance_type": "string (presencial|online|ambos)",
  "city": "string",
  "state": "string (2 chars - UF)",
  "neighborhood": "string",
  "photo": "url or null",
  "whatsapp": "string (11 digits)",
  "created_at": "datetime (ISO 8601)",
  "updated_at": "datetime (ISO 8601)"
}
```

### User

```json
{
  "id": "integer (primary key)",
  "email": "email (unique)",
  "is_active": "boolean",
  "is_staff": "boolean",
  "date_joined": "datetime",
  "professional": "integer (FK to Professional)"
}
```

### JWT Token

```json
{
  "token_type": "JWT",
  "alg": "HS256",
  "payload": {
    "user_id": "integer",
    "email": "email",
    "exp": "timestamp (expiration)",
    "iat": "timestamp (issued at)",
    "token_type": "access|refresh"
  }
}
```

---

## ✅ Validation Rules

### Professional Fields

| Field | Min/Max | Rules | Example |
|-------|---------|-------|---------|
| **name** | 5-255 | Letters, spaces, accents | "João Silva" |
| **email** | - | Valid email format | "joao@example.com" |
| **password** | 8-128 | Min 8 chars, 1 uppercase, 1 number | "SecurePass@123" |
| **bio** | 50-2000 | Minimum 50 characters | "Holistic therapist..." |
| **services** | 1-5 | From predefined list | ["Yoga", "Meditação"] |
| **price_per_session** | 50-10000 | Positive decimal | 150.00 |
| **attendance_type** | - | presencial\|online\|ambos | "presencial" |
| **city** | - | Valid city from database | "São Paulo" |
| **state** | 2 | Valid UF code | "SP" |
| **whatsapp** | 11 | Brazilian format | "11999999999" |
| **photo** | max 5MB | JPG, PNG, WebP | file |

### Valid Services

```
- Reiki
- Acupuntura
- Aromaterapia
- Massagem
- Meditação Guiada
- Tai Chi
- Reflexologia
- Cristaloterapia
- Florais
- Yoga
- Pilates Holístico
```

---

## 🔄 Response Format

All responses follow a standard format:

### Success Response

```json
{
  "data": { ... },
  "status": "success",
  "code": 200
}
```

### Error Response

```json
{
  "detail": "Error message",
  "code": 400,
  "status": "error"
}
```

---

## ❌ Error Handling

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| **200** | OK | GET request successful |
| **201** | Created | POST request successful |
| **204** | No Content | DELETE request successful |
| **400** | Bad Request | Invalid request data |
| **401** | Unauthorized | Missing or invalid token |
| **403** | Forbidden | Not verified email, not owner |
| **404** | Not Found | Resource doesn't exist |
| **500** | Server Error | Internal error |

### Common Error Responses

#### Missing Authentication
```json
{
  "detail": "Authentication credentials were not provided."
}
```

#### Invalid Token
```json
{
  "detail": "Invalid token."
}
```

#### Validation Error
```json
{
  "name": ["Este campo é obrigatório."],
  "bio": ["Mínimo 50 caracteres"]
}
```

---

## 📚 Complete Flow Example

### Registration Flow

```
1. POST /api/v1/auth/register/
   ↓ (Returns access_token + refresh_token + user_id)
   
2. Frontend stores email in localStorage
   
3. User clicks verification link from email
   ↓
   
4. GET /api/v1/auth/verify-email/{token}/
   ↓ (Sets user.is_active = True)
   
5. Redirect to login page
   
6. POST /api/v1/auth/login/
   ↓ (Returns new access_token + refresh_token)
   
7. Frontend stores tokens in localStorage
   
8. GET /api/v1/auth/me/
   ↓ (Returns user profile data)
   
9. Redirect to dashboard
```

---

## 🚀 Frontend Implementation

### Token Management

```javascript
// Store tokens
localStorage.setItem('access_token', response.data.access_token)
localStorage.setItem('refresh_token', response.data.refresh_token)

// Get token for request
const token = localStorage.getItem('access_token')

// Use in request
headers: {
  'Authorization': `Bearer ${token}`
}
```

### Auto-refresh Logic

```javascript
// When token expires (401 response)
const refreshToken = localStorage.getItem('refresh_token')
await axios.post('/api/v1/auth/refresh/', { refresh: refreshToken })
// Update access_token with new one
```

### Email Verification

```javascript
// After registration
localStorage.setItem('verification_email', email)

// After verification click
const response = await api.get(`/auth/verify-email/${token}/`)

// Before login
const email = localStorage.getItem('verification_email')
// Auto-fill form
```

---

## 📖 Postman Collection

See `HolisticMatch-API.postman_collection.json` for complete Postman collection with all endpoints.

---

## 🔗 Related Documentation

- [CHANGELOG.md](./CHANGELOG.md) - Version history and recent changes
- [README.md](./README.md) - Project overview
- [specs.md](./specs.md) - Detailed specifications
- [DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md) - Deployment instructions

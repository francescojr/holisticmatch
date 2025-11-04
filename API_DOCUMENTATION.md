# HolisticMatch Professional API Documentation

## 📋 Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Professional Endpoints](#professional-endpoints)
  - [List Professionals](#list-professionals)
  - [Get Professional Details](#get-professional-details)
  - [Create Professional](#create-professional)
  - [Update Professional](#update-professional)
  - [Delete Professional](#delete-professional)
  - [Get Service Types](#get-service-types)
  - [Upload Professional Photo](#upload-professional-photo)
- [Data Models](#data-models)
- [Validation Rules](#validation-rules)
- [Examples](#examples)
- [SDKs & Libraries](#sdks--libraries)
- [Changelog](#changelog)

## 📖 Overview

The HolisticMatch Professional API provides a comprehensive REST interface for managing holistic therapy professionals. The API enables users to discover, create, update, and manage professional profiles with full CRUD operations.

### Key Features
- 🔍 **Professional Discovery**: Search and filter professionals by services, location, and pricing
- 👤 **Profile Management**: Complete CRUD operations for professional profiles
- 🔐 **Secure Access**: JWT-based authentication with ownership-based permissions
- ✅ **Data Validation**: Comprehensive validation at both API and model levels
- 📄 **Pagination**: Efficient pagination for large result sets
- 🔄 **Filtering**: Advanced filtering capabilities

### API Version
**Current Version**: v1.0.0
**Base Path**: `/api/v1/`
**Status**: Production Ready

## 🔐 Authentication

The API uses JWT (JSON Web Token) authentication. Include the JWT token in the Authorization header for authenticated requests.

### Authentication Header
```
Authorization: Bearer <your_jwt_token>
```

### Obtaining a Token
Currently, authentication endpoints are not yet implemented in this phase. JWT tokens will be provided through the authentication system (Phase 4-5).

### Permissions
- **Public Access**: Reading professional data (list, detail, service types)
- **Authenticated Access**: Creating and managing professional profiles
- **Ownership Required**: Updating/deleting professional profiles (owners only)

## 🌐 Base URL

```
https://api.holisticmatch.com/api/v1/
```

For local development:
```
http://localhost:8000/api/v1/
```

## 📋 Response Format

All API responses follow a consistent JSON format.

### Success Response
```json
{
  "data": { ... },
  "message": "Operation successful",
  "status": "success"
}
```

### Error Response
```json
{
  "errors": {
    "field_name": ["Error message"],
    "another_field": ["Another error message"]
  },
  "message": "Validation failed",
  "status": "error"
}
```

### Paginated Response
```json
{
  "count": 25,
  "next": "https://api.holisticmatch.com/api/v1/professionals/?page=2",
  "previous": null,
  "results": [
    { ... },
    { ... }
  ]
}
```

## ❌ Error Handling

The API uses standard HTTP status codes and provides detailed error messages.

### Common HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Resource deleted successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Permission denied |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Validation Errors

Validation errors are returned with field-specific error messages:

```json
{
  "errors": {
    "name": ["Nome deve ter pelo menos 3 caracteres"],
    "bio": ["Bio deve ter pelo menos 50 caracteres"],
    "services": ["Pelo menos um serviço deve ser selecionado"],
    "price_per_session": ["Preço deve ser maior que zero"]
  },
  "message": "Validation failed",
  "status": "error"
}
```

## ⏱️ Rate Limiting

Rate limiting is not yet implemented but will be added in future phases.

## 👥 Professional Endpoints

### List Professionals

Retrieve a paginated list of professionals with optional filtering.

**Endpoint**: `GET /api/v1/professionals/`

**Authentication**: Not required

**Query Parameters**:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `service` | string | Filter by service type | `service=Reiki` |
| `city` | string | Filter by city | `city=São Paulo` |
| `state` | string | Filter by state code | `state=SP` |
| `price_min` | number | Minimum price filter | `price_min=50` |
| `price_max` | number | Maximum price filter | `price_max=200` |
| `attendance_type` | string | Filter by attendance type | `attendance_type=presencial` |
| `page` | integer | Page number for pagination | `page=2` |

**Response**: Paginated list of professionals

```json
{
  "count": 25,
  "next": "https://api.holisticmatch.com/api/v1/professionals/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "João Silva",
      "services": ["Reiki", "Acupuntura"],
      "city": "São Paulo",
      "state": "SP",
      "price_per_session": 150.00,
      "attendance_type": "ambos",
      "photo_url": "https://s3.amazonaws.com/photos/photo_1.jpg"
    }
  ]
}
```

**Example Request**:
```bash
curl -X GET "https://api.holisticmatch.com/api/v1/professionals/?service=Reiki&city=São Paulo" \
  -H "Content-Type: application/json"
```

---

### Get Professional Details

Retrieve detailed information about a specific professional.

**Endpoint**: `GET /api/v1/professionals/{id}/`

**Authentication**: Not required

**Path Parameters**:
- `id` (integer): Professional ID

**Response**: Complete professional details

```json
{
  "id": 1,
  "user": {
    "id": 1,
    "email": "joao@example.com",
    "username": "joao_silva"
  },
  "name": "João Silva",
  "bio": "Profissional experiente em terapias holísticas com mais de 10 anos de experiência. Especializado em Reiki e meditação guiada para promover bem-estar e equilíbrio espiritual.",
  "services": ["Reiki", "Acupuntura"],
  "city": "São Paulo",
  "state": "SP",
  "price_per_session": 150.00,
  "attendance_type": "ambos",
  "whatsapp": "11999999999",
  "email": "joao@example.com",
  "phone": "1133334444",
  "photo_url": "https://s3.amazonaws.com/photos/photo_1.jpg",
  "created_at": "2025-11-03T10:00:00Z",
  "updated_at": "2025-11-03T10:00:00Z"
}
```

**Example Request**:
```bash
curl -X GET "https://api.holisticmatch.com/api/v1/professionals/1/" \
  -H "Content-Type: application/json"
```

---

### Create Professional

Create a new professional profile.

**Endpoint**: `POST /api/v1/professionals/`

**Authentication**: Required (JWT token)

**Request Body**:

```json
{
  "name": "João Silva",
  "bio": "Profissional experiente em terapias holísticas com mais de 10 anos de experiência. Especializado em Reiki e meditação guiada para promover bem-estar e equilíbrio espiritual.",
  "services": ["Reiki", "Acupuntura"],
  "city": "São Paulo",
  "state": "SP",
  "price_per_session": 150.00,
  "attendance_type": "ambos",
  "whatsapp": "11999999999",
  "email": "joao@example.com",
  "phone": "1133334444"
}
```

**Response**: Created professional details (201 Created)

```json
{
  "id": 1,
  "user": {
    "id": 1,
    "email": "joao@example.com",
    "username": "joao_silva"
  },
  "name": "João Silva",
  "bio": "Profissional experiente em terapias holísticas com mais de 10 anos de experiência. Especializado em Reiki e meditação guiada para promover bem-estar e equilíbrio espiritual.",
  "services": ["Reiki", "Acupuntura"],
  "city": "São Paulo",
  "state": "SP",
  "price_per_session": 150.00,
  "attendance_type": "ambos",
  "whatsapp": "11999999999",
  "email": "joao@example.com",
  "phone": "1133334444",
  "photo_url": null,
  "created_at": "2025-11-03T10:00:00Z",
  "updated_at": "2025-11-03T10:00:00Z"
}
```

**Example Request**:
```bash
curl -X POST "https://api.holisticmatch.com/api/v1/professionals/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token_here" \
  -d '{
    "name": "João Silva",
    "bio": "Profissional experiente em terapias holísticas...",
    "services": ["Reiki"],
    "city": "São Paulo",
    "state": "SP",
    "price_per_session": 150.00,
    "attendance_type": "ambos",
    "whatsapp": "11999999999",
    "email": "joao@example.com",
    "phone": "1133334444"
  }'
```

---

### Update Professional

Update an existing professional profile.

**Endpoint**: `PATCH /api/v1/professionals/{id}/` (partial update) or `PUT /api/v1/professionals/{id}/` (full update)

**Authentication**: Required (JWT token + ownership)

**Path Parameters**:
- `id` (integer): Professional ID

**Request Body** (PATCH - partial update):

```json
{
  "price_per_session": 180.00,
  "bio": "Updated bio text..."
}
```

**Request Body** (PUT - full update):

```json
{
  "name": "João Silva",
  "bio": "Complete updated bio...",
  "services": ["Reiki", "Massagem"],
  "city": "Rio de Janeiro",
  "state": "RJ",
  "price_per_session": 180.00,
  "attendance_type": "presencial",
  "whatsapp": "21999999999",
  "email": "joao@example.com",
  "phone": "2122224444"
}
```

**Response**: Updated professional details (200 OK)

**Example Request (PATCH)**:
```bash
curl -X PATCH "https://api.holisticmatch.com/api/v1/professionals/1/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token_here" \
  -d '{"price_per_session": 180.00}'
```

---

### Delete Professional

Delete a professional profile.

**Endpoint**: `DELETE /api/v1/professionals/{id}/`

**Authentication**: Required (JWT token + ownership)

**Path Parameters**:
- `id` (integer): Professional ID

**Response**: 204 No Content

**Example Request**:
```bash
curl -X DELETE "https://api.holisticmatch.com/api/v1/professionals/1/" \
  -H "Authorization: Bearer your_jwt_token_here"
```

---

### Get Service Types

Retrieve the list of available service types.

**Endpoint**: `GET /api/v1/professionals/service_types/`

**Authentication**: Not required

**Response**: Array of service type strings

```json
[
  "Reiki",
  "Acupuntura",
  "Massagem",
  "Tarot",
  "Astrologia",
  "Cristaloterapia",
  "Aromaterapia",
  "Meditação",
  "Yoga",
  "Terapia Floral"
]
```

**Example Request**:
```bash
curl -X GET "https://api.holisticmatch.com/api/v1/professionals/service_types/" \
  -H "Content-Type: application/json"
```

---

### Upload Professional Photo

Upload or update a professional's profile photo.

**Endpoint**: `POST /api/v1/professionals/{id}/upload-photo/`

**Authentication**: Required (JWT token) - Must be the profile owner

**Content-Type**: `multipart/form-data`

**Request Parameters**:
- `photo` (file): Profile photo file (JPG/PNG, max 5MB)

**Response**: Photo upload confirmation (200 OK)

```json
{
  "message": "Foto atualizada com sucesso",
  "photo_url": "https://s3.amazonaws.com/holisticmatch-photos/photos/photo_123.jpg"
}
```

**Error Responses**:

400 Bad Request:
```json
{
  "error": "Arquivo de foto é obrigatório"
}
```

403 Forbidden:
```json
{
  "error": "Você só pode alterar sua própria foto"
}
```

404 Not Found:
```json
{
  "error": "Profissional não encontrado"
}
```

**Example Request**:
```bash
curl -X POST "https://api.holisticmatch.com/api/v1/professionals/1/upload-photo/" \
  -H "Authorization: Bearer your_jwt_token_here" \
  -F "photo=@profile_photo.jpg"
```

**Notes**:
- Only JPG and PNG formats are accepted
- Maximum file size is 5MB
- Old photos are automatically deleted when replaced
- Photo is stored in AWS S3 with public read access

## 📊 Data Models

### Professional Model

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | integer | Auto | Unique identifier |
| `user` | object | Auto | Associated user account |
| `name` | string | Yes | Professional full name (3-255 chars) |
| `bio` | string | Yes | Professional biography (50-2000 chars) |
| `services` | array | Yes | List of services offered (1-10 items) |
| `city` | string | Yes | City of operation |
| `state` | string | Yes | Brazilian state code (2 chars) |
| `price_per_session` | decimal | Yes | Price per session (10.00-5000.00) |
| `attendance_type` | string | Yes | Attendance type: 'presencial', 'online', 'ambos' |
| `whatsapp` | string | No | WhatsApp number (Brazilian format) |
| `email` | string | Yes | Contact email |
| `phone` | string | No | Phone number (Brazilian format) |
| `photo` | file | No | Profile photo (JPG/PNG, max 5MB) |
| `photo_url` | string | Auto | S3 URL of profile photo |
| `created_at` | datetime | Auto | Creation timestamp |
| `updated_at` | datetime | Auto | Last update timestamp |

### User Model (Nested)

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | User ID |
| `email` | string | User email |
| `username` | string | Username |

## ✅ Validation Rules

### Name Validation
- Minimum 3 characters
- Maximum 255 characters
- Only letters, spaces, and basic punctuation allowed

### Bio Validation
- Minimum 50 characters
- Maximum 2000 characters
- Must contain meaningful content

### Services Validation
- At least 1 service required
- Maximum 10 services allowed
- No duplicate services
- Must be from predefined service list

### State Validation
- Must be valid Brazilian state code (2 characters)
- Case-insensitive (converted to uppercase)
- Valid codes: AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO

### Price Validation
- Minimum: R$ 10.00
- Maximum: R$ 5,000.00
- Must be positive decimal number

### Phone/WhatsApp Validation
- Brazilian format only
- Mobile: 11 digits (starts with 9)
- Landline: 10 digits
- WhatsApp and phone cannot be the same if both provided

### Email Validation
- Standard email format
- Must be unique across all professionals

### Photo Validation
- Maximum file size: 5MB
- Allowed formats: JPG, PNG
- Square aspect ratio recommended

## 💡 Examples

### Complete Professional Registration Flow

```javascript
// 1. Authenticate user (future implementation)
// const token = await authenticateUser(email, password);

// 2. Create professional profile
const professionalData = {
  name: "João Silva",
  bio: "Profissional experiente em terapias holísticas com mais de 10 anos de experiência. Especializado em Reiki e meditação guiada para promover bem-estar e equilíbrio espiritual.",
  services: ["Reiki", "Acupuntura"],
  city: "São Paulo",
  state: "SP",
  price_per_session: 150.00,
  attendance_type: "ambos",
  whatsapp: "11999999999",
  email: "joao@example.com",
  phone: "1133334444"
};

const response = await fetch('/api/v1/professionals/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(professionalData)
});

const professional = await response.json();
console.log('Professional created:', professional);

// 3. Upload profile photo (optional)
if (photoFile) {
  const formData = new FormData();
  formData.append('photo', photoFile);

  const photoResponse = await fetch(`/api/v1/professionals/${professional.id}/upload-photo/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const photoResult = await photoResponse.json();
  console.log('Photo uploaded:', photoResult.photo_url);
}
```

### Complete Registration with Photo Upload

```javascript
async function registerProfessionalWithPhoto(userData, professionalData, photoFile) {
  try {
    // Note: Authentication will be implemented in future phases
    // const authResponse = await fetch('/api/v1/auth/register/', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(userData)
    // });
    // const { access_token } = await authResponse.json();

    // For now, create professional directly (Phase 3 implementation)
    const response = await fetch('/api/v1/professionals/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${access_token}`
      },
      body: JSON.stringify(professionalData)
    });

    if (!response.ok) {
      throw new Error(`Registration failed: ${response.status}`);
    }

    const professional = await response.json();
    console.log('Professional registered:', professional.id);

    // Upload photo if provided
    if (photoFile) {
      const formData = new FormData();
      formData.append('photo', photoFile);

      const photoResponse = await fetch(`/api/v1/professionals/${professional.id}/upload-photo/`, {
        method: 'POST',
        headers: {
          // 'Authorization': `Bearer ${access_token}`
        },
        body: formData
      });

      if (photoResponse.ok) {
        const photoResult = await photoResponse.json();
        console.log('Photo uploaded successfully:', photoResult.photo_url);
      } else {
        console.warn('Photo upload failed, but professional was created');
      }
    }

    return professional;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// Usage example
const professionalData = {
  name: "Maria Santos",
  bio: "Terapeuta holística especializada em Reiki e cristaloterapia.",
  services: ["Reiki", "Cristaloterapia"],
  city: "Rio de Janeiro",
  state: "RJ",
  price_per_session: 120.00,
  attendance_type: "ambos",
  whatsapp: "21999999999",
  email: "maria@example.com",
  phone: "2122223333"
};

const photoFile = document.getElementById('photo-input').files[0];
const result = await registerProfessionalWithPhoto(null, professionalData, photoFile);
```

### Search Professionals by Service and Location

```javascript
// Search for Reiki practitioners in São Paulo
const searchParams = new URLSearchParams({
  service: 'Reiki',
  city: 'São Paulo',
  price_max: 200
});

const response = await fetch(`/api/v1/professionals/?${searchParams}`);
const data = await response.json();

console.log(`Found ${data.count} professionals`);
data.results.forEach(prof => {
  console.log(`${prof.name} - R$ ${prof.price_per_session}`);
});
```

### Update Professional Profile

```javascript
const updateData = {
  price_per_session: 180.00,
  bio: "Updated professional bio with new information..."
};

const response = await fetch(`/api/v1/professionals/${professionalId}/`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(updateData)
});

if (response.ok) {
  console.log('Profile updated successfully');
} else {
  const errors = await response.json();
  console.error('Update failed:', errors);
}
```

## 🔧 SDKs & Libraries

### JavaScript/TypeScript Client

A JavaScript SDK is planned for future releases to simplify API integration.

### Python Client

```python
# Planned Python client library
from holisticmatch import ProfessionalAPI

api = ProfessionalAPI(api_key='your_jwt_token')

# List professionals
professionals = api.professionals.list(service='Reiki', city='São Paulo')

# Create professional
new_prof = api.professionals.create({
    'name': 'João Silva',
    'bio': 'Professional bio...',
    'services': ['Reiki'],
    # ... other fields
})
```

## 📝 Changelog

### Version 1.0.1 (November 2025)
- 🆕 **Upload Professional Photo Endpoint**: `POST /api/v1/professionals/{id}/upload-photo/`
- 📸 **Photo Upload Integration**: Complete S3 photo upload with validation
- 🔧 **Enhanced Professional Creation**: Improved error handling and validation
- 📚 **Complete Registration Flow**: End-to-end professional registration documentation
- 💡 **JavaScript Examples**: Added comprehensive code examples for photo upload

### Version 1.0.0 (November 2025)
- ✅ Initial release with full CRUD operations
- ✅ JWT authentication and ownership permissions
- ✅ Comprehensive data validation
- ✅ Advanced filtering and pagination
- ✅ Service type management
- ✅ AWS S3 photo storage integration

### Planned Features
- 🔄 Rate limiting implementation
- 🔄 API versioning strategy
- 🔄 Webhook notifications
- 🔄 Bulk operations
- 🔄 Advanced search with full-text
- 🔄 Analytics and metrics endpoints

---

## 📞 Support

For API support, please contact:
- **Email**: api@holisticmatch.com
- **Documentation**: https://docs.holisticmatch.com
- **Status Page**: https://status.holisticmatch.com

## 📜 License

This API documentation is part of the HolisticMatch platform. All rights reserved.
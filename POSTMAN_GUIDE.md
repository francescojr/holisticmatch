# 🧘 HolisticMatch API - Guia Completo Postman

## 1️⃣ Setup Inicial

### Importar Collection

1. Abrir Postman
2. **File** → **Import**
3. Selecionar: `HolisticMatch-API.postman_collection.json`
4. Clique em **Import**

### Criar Environment

1. **Environments** (lado esquerdo)
2. **Create New Environment**
3. Nome: `HolisticMatch`
4. Adicionar variáveis:

```json
{
  "BASE_URL": "http://localhost:8000",
  "PROD_URL": "https://api.holisticmatch.com",
  "ACCESS_TOKEN": "",
  "REFRESH_TOKEN": "",
  "USER_ID": "",
  "PROFESSIONAL_ID": ""
}
```

5. **Save** (Ctrl+S)

## 2️⃣ Workflow Testado

### A. Registrar Profissional (com foto)

**Endpoint**: `POST {{BASE_URL}}/api/v1/auth/register/`

**Body** → `form-data`:

| Key | Value | Type |
|-----|-------|------|
| `email` | `seu_email@test.com` | text |
| `password` | `SenhaForte123!` | text |
| `name` | `João Silva` | text |
| `bio` | `Reikiano com 10 anos de experiência em cura holística e bem-estar geral` | text |
| `services` | `["Reiki", "Massagem Holística"]` | text |
| `price_per_session` | `150.00` | text |
| `attendance_type` | `online` | text |
| `city` | `São Paulo` | text |
| `state` | `SP` | text |
| `whatsapp` | `11999999999` | text |
| `neighborhood` | `Vila Mariana` | text |
| `photo` | `[selecionar arquivo .jpg 2-5MB]` | file |

**Response esperado** (201 Created):
```json
{
  "message": "Profissional registrado com sucesso. Verifique seu email",
  "professional": {
    "id": 123,
    "name": "João Silva",
    "email": "seu_email@test.com",
    "photo": "https://...",
    ...
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user_id": 456,
  "professional_id": 123
}
```

**Salvar Tokens**:
1. Clique na aba **Tests**
2. Adicione script:
```javascript
var jsonData = pm.response.json();
pm.environment.set("ACCESS_TOKEN", jsonData.access_token);
pm.environment.set("REFRESH_TOKEN", jsonData.refresh_token);
pm.environment.set("USER_ID", jsonData.user_id);
pm.environment.set("PROFESSIONAL_ID", jsonData.professional_id);
```
3. Clique **Send**

### B. Login (Altern)

**Endpoint**: `POST {{BASE_URL}}/api/v1/auth/login/`

**Body** → `raw` (JSON):
```json
{
  "email": "seu_email@test.com",
  "password": "SenhaForte123!"
}
```

**Response** (200 OK):
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "user_id": 456,
  "professional_id": 123
}
```

### C. Verificar Email

**Endpoint**: `POST {{BASE_URL}}/api/v1/auth/verify-email/`

**Body** → `raw` (JSON):
```json
{
  "token": "[token recebido no email]"
}
```

**Response** (200 OK):
```json
{
  "message": "Email verificado com sucesso"
}
```

### D. Listar Profissionais

**Endpoint**: `GET {{BASE_URL}}/api/v1/professionals/`

**Headers**:
```
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

**Params** (Query):
| Key | Value |
|-----|-------|
| `service` | `Reiki` |
| `city` | `São Paulo` |
| `state` | `SP` |
| `attendance_type` | `online` |

**Response** (200 OK):
```json
{
  "count": 42,
  "next": "http://...",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "João Silva",
      "email": "joao@...",
      "bio": "...",
      "photo": "https://...",
      "services": ["Reiki"],
      "price_per_session": 150.00,
      "attendance_type": "online",
      "city": "São Paulo",
      "state": "SP",
      "whatsapp": "11999999999",
      ...
    },
    ...
  ]
}
```

### E. Obter Detalhes de Um Profissional

**Endpoint**: `GET {{BASE_URL}}/api/v1/professionals/123/`

**Headers**:
```
Content-Type: application/json
```

**Response** (200 OK):
```json
{
  "id": 123,
  "name": "João Silva",
  "email": "joao@...",
  "bio": "...",
  "photo": "https://...",
  "services": ["Reiki", "Massagem Holística"],
  "price_per_session": 150.00,
  "attendance_type": "online",
  "city": "São Paulo",
  "state": "SP",
  "neighborhood": "Vila Mariana",
  "whatsapp": "11999999999",
  "rating": 4.8,
  "reviews_count": 12,
  ...
}
```

### F. Atualizar Perfil (Autenticado)

**Endpoint**: `PATCH {{BASE_URL}}/api/v1/professionals/{{PROFESSIONAL_ID}}/`

**Headers**:
```
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: multipart/form-data
```

**Body** → `form-data`:
```
name: João Silva Atualizado
bio: Reikiano com 15 anos de experiência...
price_per_session: 200.00
```

**Response** (200 OK):
```json
{
  "id": 123,
  "name": "João Silva Atualizado",
  ...
}
```

## 3️⃣ Errors Esperados & Soluções

### 400 Bad Request - "O dado submetido não é um arquivo"

**Causa**: Foto não foi enviada como multipart/form-data

**Solução Postman**:
1. Vá em **Body**
2. Selecione **form-data** (NÃO raw!)
3. Type do `photo` deve ser **file** (não text)
4. Clique no campo de arquivo e selecione sua foto

### 413 Request Entity Too Large

**Causa**: Arquivo maior que 250MB (ou limite nginx/Django)

**Solução**: Use foto 2-5MB máximo

### 401 Unauthorized - "Token inválido"

**Causa**: Token expirado ou não configurado

**Solução**:
1. Vá em **Auth** (aba superior)
2. Type: **Bearer Token**
3. Token: `{{ACCESS_TOKEN}}`
4. Clique **Save**

### 404 Not Found

**Causa**: Professional ID não existe

**Solução**: Use `GET /professionals/` para listar e pegar ID real

## 4️⃣ Refresh Token

Quando access token expirar:

**Endpoint**: `POST {{BASE_URL}}/api/v1/auth/refresh/`

**Body** → `raw` (JSON):
```json
{
  "refresh": "{{REFRESH_TOKEN}}"
}
```

**Response** (200 OK):
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Atualizar Environment**:
```javascript
var jsonData = pm.response.json();
pm.environment.set("ACCESS_TOKEN", jsonData.access);
pm.environment.set("REFRESH_TOKEN", jsonData.refresh);
```

## 5️⃣ Teste de Filtros

### Exemplo 1: Reikiano em SP
```
GET {{BASE_URL}}/api/v1/professionals/?service=Reiki&state=SP&city=São Paulo
```

### Exemplo 2: Online, Preço até 200
```
GET {{BASE_URL}}/api/v1/professionals/?attendance_type=online&max_price=200
```

### Exemplo 3: Presencial em Vila Mariana
```
GET {{BASE_URL}}/api/v1/professionals/?attendance_type=presencial&neighborhood=Vila%20Mariana
```

## 6️⃣ Troubleshooting

| Problema | Verificar |
|----------|-----------|
| "Base URL não resolveu" | Environment ativo? Servidor rodando? |
| "Token inválido" | ACCESS_TOKEN salvo em environment? |
| "Arquivo não é válido" | Form-data com type=file? |
| "Email já existe" | Use novo email a cada teste |
| "Status 500" | Verifique logs backend: `eb logs` |

## 7️⃣ URLs de Referência

| Ambiente | URL |
|----------|-----|
| Local | `http://localhost:8000` |
| Desenvolvimento | `https://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com` |
| Produção | `https://api.holisticmatch.com` |

---

**Status**: ✅ Guia completo para Postman
**Última atualização**: Nov 7, 2025
**Backend**: Pronto para testes com foto upload (250MB limit)

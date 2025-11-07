# 🚀 API Reference - Referência Rápida

## Base URLs

| Ambiente | URL |
|----------|-----|
| **Produção** | `https://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1` |
| **Local** | `http://localhost:8000/api/v1` |

## Authentication

```bash
# Header obrigatório para endpoints protegidos:
Authorization: Bearer {ACCESS_TOKEN}
```

---

## Endpoints Principais

### 1️⃣ Registrar (POST)
```
POST /auth/register/
Content-Type: multipart/form-data

✅ Requerido:
- email (unique)
- password (min 8 chars)
- name (min 5 chars)
- bio (min 50 chars)
- services (JSON array: ["Reiki", "Massagem"])
- price_per_session (number)
- attendance_type (presencial|online|ambos)
- city
- state (2 letters)
- whatsapp
- photo (JPEG/PNG, 2-5MB)

📤 Response (201):
{
  "message": "Profissional registrado...",
  "professional": {...},
  "access_token": "...",
  "refresh_token": "...",
  "user_id": 123,
  "professional_id": 456
}
```

### 2️⃣ Login (POST)
```
POST /auth/login/
Content-Type: application/json

{
  "email": "seu@email.com",
  "password": "senha123"
}

📤 Response (200):
{
  "access_token": "...",
  "refresh_token": "...",
  "user_id": 123,
  "professional_id": 456
}
```

### 3️⃣ Verificar Email (POST)
```
POST /auth/verify-email/
Content-Type: application/json

{
  "token": "[token do email]"
}

📤 Response (200):
{
  "message": "Email verificado com sucesso"
}
```

### 4️⃣ Refresh Token (POST)
```
POST /auth/refresh/
Content-Type: application/json

{
  "refresh": "{{REFRESH_TOKEN}}"
}

📤 Response (200):
{
  "access": "novo_access_token",
  "refresh": "novo_refresh_token"
}
```

### 5️⃣ Perfil Atual (GET) ✅ Auth Required
```
GET /auth/me/
Authorization: Bearer {{ACCESS_TOKEN}}

📤 Response (200):
{
  "id": 123,
  "email": "seu@email.com",
  "full_name": "João Silva",
  "professional_id": 456,
  "email_verified": true
}
```

### 6️⃣ Listar Profissionais (GET)
```
GET /professionals/?page=1&page_size=20&service=Reiki&city=São Paulo

Filtros opcionais:
?search=joão              # nome ou bio
?service=Reiki            # tipo serviço
?city=São Paulo           # cidade
?state=SP                 # estado
?attendance_type=online   # presencial|online|ambos

📤 Response (200):
{
  "count": 42,
  "next": "...",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "João Silva",
      "bio": "...",
      "photo": "https://...",
      "services": ["Reiki"],
      "price_per_session": 150.00,
      "city": "São Paulo",
      "state": "SP"
    },
    ...
  ]
}
```

### 7️⃣ Detalhes Profissional (GET)
```
GET /professionals/456/

📤 Response (200):
{
  "id": 456,
  "name": "João Silva",
  "email": "joao@example.com",
  "bio": "...",
  "photo": "https://...",
  "services": ["Reiki", "Massagem"],
  "price_per_session": 150.00,
  "attendance_type": "online",
  "city": "São Paulo",
  "state": "SP",
  "neighborhood": "Vila Mariana",
  "whatsapp": "11999999999"
}
```

### 8️⃣ Atualizar Perfil (PATCH) ✅ Auth Required
```
PATCH /professionals/456/
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: multipart/form-data

Opcionais:
- name
- bio
- services (JSON array como string)
- price_per_session
- attendance_type
- city, state, neighborhood
- photo (arquivo)

📤 Response (200):
{
  "id": 456,
  ...campos atualizados...
}
```

### 9️⃣ Deletar Perfil (DELETE) ✅ Auth Required
```
DELETE /professionals/456/
Authorization: Bearer {{ACCESS_TOKEN}}

📤 Response (204):
[Sem conteúdo - deletado]
```

### 🔟 Logout (POST) ✅ Auth Required
```
POST /auth/logout/
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
  "refresh_token": "{{REFRESH_TOKEN}}"
}

📤 Response (200):
{
  "message": "Logout bem-sucedido"
}
```

---

## Errors Comuns

| Status | Erro | Solução |
|--------|------|--------|
| **400** | "O dado submetido não é um arquivo" | Enviar multipart/form-data (não raw) |
| **400** | "Email já cadastrado" | Usar novo email |
| **401** | "Token inválido" | Re-fazer login ou usar refresh |
| **403** | "Email não verificado" | Clique no link do email |
| **404** | Professional not found | ID não existe |
| **413** | Request entity too large | Foto > 250MB |
| **500** | Server error | Verificar logs: `eb logs` |

---

## Documentação Completa

- **OpenAPI JSON**: `/openapi.json`
- **OpenAPI YAML**: `/openapi.yaml`
- **Swagger UI**: `/swagger-ui.html`
- **Postman**: `POSTMAN_GUIDE.md`
- **cURL**: `CURL_TESTS.sh`

---

## File Upload - IMPORTANTE ⚠️

**Limitações atualizadas** (Nov 7, 2025):

```
Nginx (frontend)  : 250MB
Django (backend)  : 250MB
Axios timeout     : 30 segundos
```

**Checklist ao fazer upload**:

- ✅ Use `multipart/form-data`
- ✅ Type do campo `photo` = `file`
- ✅ NÃO envie `Content-Type: application/json`
- ✅ Foto 2-5MB (recomendado)
- ✅ Formatos: JPEG, PNG
- ✅ Axios remove header `Content-Type` automaticamente para FormData

**Erro 400 "não é arquivo"**?
→ Frontend não reconheceu FormData  
→ Limpe cache (Ctrl+Shift+Delete)  
→ Recarregue página  
→ Teste novamente

---

## Postman Environment Variables

```json
{
  "BASE_URL": "http://localhost:8000",
  "ACCESS_TOKEN": "[salvo após login/registrar]",
  "REFRESH_TOKEN": "[salvo após login/registrar]",
  "USER_ID": "[salvo após login/registrar]",
  "PROFESSIONAL_ID": "[salvo após login/registrar]"
}
```

**Auto-salvar tokens**: Adicione script na aba **Tests**:
```javascript
var jsonData = pm.response.json();
pm.environment.set("ACCESS_TOKEN", jsonData.access_token);
pm.environment.set("REFRESH_TOKEN", jsonData.refresh_token);
pm.environment.set("USER_ID", jsonData.user_id);
pm.environment.set("PROFESSIONAL_ID", jsonData.professional_id);
```

---

## Links Úteis

- **Backend Logs**: `eb logs holisticmatch-env`
- **Frontend**: https://holisticmatch.vercel.app
- **GitHub**: https://github.com/francescojr/holisticmatch
- **Status**: 🟢 Production Ready

---

**Última atualização**: Nov 7, 2025  
**Status**: ✅ Verified Working

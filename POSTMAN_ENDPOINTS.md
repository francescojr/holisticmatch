# 🧘 HolisticMatch API - Endpoints Postman

**Base URL:** 
- **Local:** `http://localhost:8000`
- **EB (Produção):** `http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com`
- **Via Vercel (Frontend):** `https://holisticmatch.vercel.app/api`

---

## 📋 Endpoints Disponíveis

### 1️⃣ **Listar Profissionais**

```
GET /api/v1/professionals/
```

**Descrição:** Retorna lista paginada de profissionais  
**Permissão:** Pública (sem autenticação)  
**Paginação:** Padrão 12 por página

**Query Parameters:**

| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `service` | string | Filtrar por tipo de serviço | `?service=Reiki` |
| `city` | string | Filtrar por cidade (case-insensitive) | `?city=São Paulo` |
| `state` | string | Filtrar por estado (case-insensitive) | `?state=SP` |
| `price_min` | number | Preço mínimo por sessão | `?price_min=100` |
| `price_max` | number | Preço máximo por sessão | `?price_max=200` |
| `attendance_type` | string | Tipo de atendimento: `presencial`, `online`, `ambos` | `?attendance_type=online` |
| `limit` | integer | Quantidade por página (padrão 12) | `?limit=20` |
| `offset` | integer | Paginação (offset) | `?offset=12` |

**Exemplo com Filtros:**
```
GET /api/v1/professionals/?service=Reiki&city=São Paulo&price_min=100&price_max=200
```

**Response (200 OK):**
```json
{
  "count": 12,
  "next": "http://localhost:8000/api/v1/professionals/?limit=12&offset=12",
  "previous": null,
  "results": [
    {
      "id": 24,
      "name": "André Souza",
      "services": ["Reiki", "Cristaloterapia", "Florais", "Aromaterapia"],
      "city": "Fortaleza",
      "state": "CE",
      "price_per_session": "155.00",
      "attendance_type": "ambos",
      "photo_url": null
    },
    {
      "id": 23,
      "name": "Beatriz Silva",
      "services": ["Meditação Guiada", "Yoga", "Florais"],
      "city": "Campinas",
      "state": "SP",
      "price_per_session": "110.00",
      "attendance_type": "online",
      "photo_url": null
    }
  ]
}
```

---

### 2️⃣ **Detalhe de Um Profissional**

```
GET /api/v1/professionals/{id}/
```

**Descrição:** Retorna detalhes completos de um profissional específico  
**Permissão:** Pública  
**Path Parameter:** `id` (número inteiro)

**Exemplo:**
```
GET /api/v1/professionals/24/
```

**Response (200 OK):**
```json
{
  "id": 24,
  "name": "André Souza",
  "services": ["Reiki", "Cristaloterapia", "Florais", "Aromaterapia"],
  "city": "Fortaleza",
  "state": "CE",
  "price_per_session": "155.00",
  "attendance_type": "ambos",
  "photo_url": null,
  "bio": "Terapeuta holístico com 10 anos de experiência",
  "phone": "+55 85 98765-4321",
  "email": "andre@example.com",
  "rating": 4.8,
  "reviews_count": 25
}
```

**Erro (404):**
```json
{
  "detail": "Not found."
}
```

---

### 3️⃣ **Listar Tipos de Serviço**

```
GET /api/v1/professionals/service_types/
```

**Descrição:** Retorna lista de todos os tipos de serviços disponíveis  
**Permissão:** Pública  
**Query Parameters:** Nenhum

**Response (200 OK):**
```json
[
  "Reiki",
  "Acupuntura",
  "Aromaterapia",
  "Massagem",
  "Meditação Guiada",
  "Tai Chi",
  "Reflexologia",
  "Cristaloterapia",
  "Florais",
  "Yoga",
  "Pilates Holístico"
]
```

---

## 🧪 Testes Rápidos no Postman

### **Teste 1: Todos os Profissionais**
```
GET http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/
```
✅ Espera: `200 OK` com 12 profissionais

---

### **Teste 2: Filtrar por Serviço**
```
GET http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/?service=Reiki
```
✅ Espera: `200 OK` com profissionais que oferecem Reiki

---

### **Teste 3: Filtrar por Localização**
```
GET http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/?city=São Paulo
```
✅ Espera: `200 OK` com profissionais de São Paulo

---

### **Teste 4: Filtrar por Tipo de Atendimento**
```
GET http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/?attendance_type=online
```
✅ Espera: `200 OK` com profissionais que atendem online

---

### **Teste 5: Filtro Múltiplo (Service + Preço)**
```
GET http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/?service=Yoga&price_min=100&price_max=150
```
✅ Espera: `200 OK` com profissionais que:
- Oferecem Yoga
- Preço entre R$ 100 e R$ 150

---

### **Teste 6: Detalhe de Um Profissional**
```
GET http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/24/
```
✅ Espera: `200 OK` com detalhes do André Souza

---

### **Teste 7: Tipos de Serviço**
```
GET http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/service_types/
```
✅ Espera: `200 OK` com array de 11 serviços

---

### **Teste 8: Paginação**
```
GET http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/?limit=5&offset=0
```
✅ Espera: `200 OK` com primeiros 5 profissionais

---

## 📝 Postman Collection JSON

Você pode importar este JSON diretamente no Postman:

```json
{
  "info": {
    "name": "HolisticMatch API",
    "description": "API endpoints para teste",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Profissionais",
      "item": [
        {
          "name": "Listar Todos",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{base_url}}/api/v1/professionals/",
              "protocol": "http",
              "host": ["{{base_url}}"],
              "path": ["api", "v1", "professionals"]
            }
          }
        },
        {
          "name": "Filtrar por Serviço",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{base_url}}/api/v1/professionals/?service=Reiki",
              "protocol": "http",
              "host": ["{{base_url}}"],
              "path": ["api", "v1", "professionals"],
              "query": [{"key": "service", "value": "Reiki"}]
            }
          }
        },
        {
          "name": "Filtrar por Localização",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{base_url}}/api/v1/professionals/?city=São Paulo",
              "protocol": "http",
              "host": ["{{base_url}}"],
              "path": ["api", "v1", "professionals"],
              "query": [{"key": "city", "value": "São Paulo"}]
            }
          }
        },
        {
          "name": "Detalhes de Um Profissional",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{base_url}}/api/v1/professionals/24/",
              "protocol": "http",
              "host": ["{{base_url}}"],
              "path": ["api", "v1", "professionals", "24"]
            }
          }
        },
        {
          "name": "Listar Tipos de Serviço",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{base_url}}/api/v1/professionals/service_types/",
              "protocol": "http",
              "host": ["{{base_url}}"],
              "path": ["api", "v1", "professionals", "service_types"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com",
      "type": "string"
    }
  ]
}
```

---

## 🔧 Headers Necessários

Para a maioria dos endpoints públicos:

```
Content-Type: application/json
Accept: application/json
```

---

## 📊 Status dos Endpoints

| Endpoint | Método | Status | Autenticação |
|----------|--------|--------|--------------|
| `/professionals/` | GET | ✅ Ativo | Não |
| `/professionals/{id}/` | GET | ✅ Ativo | Não |
| `/professionals/service_types/` | GET | ✅ Ativo | Não |

---

## 🐛 Troubleshooting

**Erro 404?**
- Verifique se o ID do profissional existe (1-24)

**Erro 400 no filtro?**
- Verifique a ortografia dos valores de filtro
- Use `?service=Reiki` (com capitalização correta)

**Timeout?**
- Verifique se o backend está rodando: `eb status`
- Tente conectar direto: `http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/`

---

✅ **Tudo pronto para testar!** Copie e cole os URLs no Postman e bom teste! 🚀

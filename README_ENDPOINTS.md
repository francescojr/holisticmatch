# 🧘 API HolisticMatch - Endpoints para Postman

## 📚 Arquivos de Referência

| Arquivo | Descrição | Uso |
|---------|-----------|-----|
| **COMO_TESTAR.md** | ⭐ Guia passo a passo | Comece aqui! |
| **POSTMAN_QUICK.md** | URLs prontas | Copy & paste |
| **POSTMAN_ENDPOINTS.md** | Documentação completa | Referência |
| **HolisticMatch-API.postman_collection.json** | Collection Postman | Importar no Postman |
| **CURL_TESTS.sh** | Exemplos cURL | Terminal |

---

## 🚀 Endpoints Disponíveis

### 1. Listar Profissionais
```http
GET /api/v1/professionals/
```

**Filtros disponíveis:**
- `service` - Tipo de serviço (ex: Reiki, Yoga)
- `city` - Cidade (ex: São Paulo)
- `state` - Estado (ex: SP)
- `price_min` - Preço mínimo
- `price_max` - Preço máximo
- `attendance_type` - online/presencial/ambos
- `limit` - Itens por página (padrão: 12)
- `offset` - Paginação

**Exemplos:**
```
GET /api/v1/professionals/
GET /api/v1/professionals/?service=Yoga
GET /api/v1/professionals/?city=São Paulo&price_min=100&price_max=200
GET /api/v1/professionals/?attendance_type=online
GET /api/v1/professionals/?limit=5&offset=0
```

---

### 2. Detalhes de Um Profissional
```http
GET /api/v1/professionals/{id}/
```

**IDs válidos:** 13-24

**Exemplos:**
```
GET /api/v1/professionals/24/
GET /api/v1/professionals/23/
GET /api/v1/professionals/13/
```

---

### 3. Tipos de Serviço
```http
GET /api/v1/professionals/service_types/
```

**Retorna array com 11 serviços disponíveis**

---

## 🔗 URLs Completas (Production)

```
Base: http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com

GET http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/
GET http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/24/
GET http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/service_types/
```

---

## 📊 Dados Disponíveis para Teste

**Profissionais:** 12 (IDs 13-24)

**Serviços:**
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

**Estados:** BA, CE, DF, MG, PR, RJ, RS, SC, SP, PE

**Cidades:** 
- São Paulo (3 profissionais)
- Rio de Janeiro, Belo Horizonte, Brasília, Salvador, Fortaleza, Recife, Porto Alegre, Curitiba, Campinas, Florianópolis

---

## 💡 Quick Tests

### Test 1: Todos os Profissionais
```bash
curl http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/
```

### Test 2: Filtrar Yoga
```bash
curl "http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/?service=Yoga"
```

### Test 3: Online e Barato
```bash
curl "http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/?attendance_type=online&price_max=150"
```

### Test 4: Um Profissional
```bash
curl http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/24/
```

### Test 5: Serviços
```bash
curl http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/service_types/
```

---

## ✅ Status

| Componente | Status | Detalhes |
|-----------|--------|----------|
| Backend | ✅ Online | 12 profissionais carregando |
| Frontend | ✅ Online | https://holisticmatch.vercel.app |
| Database | ✅ Conectado | Supabase PostgreSQL |
| Endpoints | ✅ Ativos | 3 endpoints públicos |

---

**Criado em:** 1º de Novembro de 2025

**Próximas ações:**
1. Abra `COMO_TESTAR.md` para instruções
2. Teste os endpoints no Postman
3. Combine filtros para buscar dados específicos
4. Compartilhe com seu time!

🚀 **Bora testar!**

# 🎯 ENDPOINTS RÁPIDO PARA POSTMAN

## Base URLs

```
🔵 Produção (AWS EB):
http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com

🟢 Local:
http://localhost:8000

🟣 Via Vercel (Frontend):
https://holisticmatch.vercel.app/api
```

---

## 📋 Endpoints Disponíveis

### ✅ GET /api/v1/professionals/
**Lista todos os profissionais com paginação (12 por página)**

```
http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/
```

**Filtros disponíveis:**
- `?service=Reiki` - Filtrar por serviço
- `?city=São Paulo` - Filtrar por cidade
- `?state=SP` - Filtrar por estado
- `?price_min=100` - Preço mínimo
- `?price_max=200` - Preço máximo
- `?attendance_type=online` - Tipo: online, presencial, ambos
- `?limit=20` - Itens por página
- `?offset=12` - Paginação

**Exemplos:**
```
GET /api/v1/professionals/?service=Yoga
GET /api/v1/professionals/?city=São Paulo&price_min=100&price_max=200
GET /api/v1/professionals/?attendance_type=online&limit=5
GET /api/v1/professionals/?limit=20&offset=0
```

---

### ✅ GET /api/v1/professionals/{id}/
**Detalhe de um profissional específico**

```
http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/24/
```

**IDs válidos:** 13-24 (12 profissionais no banco)

**Exemplos:**
```
GET /api/v1/professionals/24/  → André Souza
GET /api/v1/professionals/23/  → Beatriz Silva
GET /api/v1/professionals/22/  → Luciana Martins
```

---

### ✅ GET /api/v1/professionals/service_types/
**Lista tipos de serviços disponíveis**

```
http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/service_types/
```

**Retorna:**
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

## 🧪 COPY & PASTE - Testes Rápidos

### Teste 1: Todos os Profissionais
```
GET http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/
```

### Teste 2: Filtrar Yoga
```
GET http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/?service=Yoga
```

### Teste 3: Online até R$150
```
GET http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/?attendance_type=online&price_max=150
```

### Teste 4: São Paulo
```
GET http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/?city=São Paulo
```

### Teste 5: Um Profissional
```
GET http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/24/
```

### Teste 6: Serviços Disponíveis
```
GET http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/service_types/
```

### Teste 7: Primeiro 5 itens
```
GET http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/?limit=5&offset=0
```

### Teste 8: Reiki em Fortaleza
```
GET http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/?service=Reiki&city=Fortaleza
```

---

## 📊 Dados de Teste (IDs dos Profissionais)

| ID  | Nome | Cidade | Serviços | Preço |
|-----|------|--------|----------|-------|
| 24  | André Souza | Fortaleza | Reiki, Cristaloterapia, Florais | R$ 155,00 |
| 23  | Beatriz Silva | Campinas | Meditação, Yoga, Florais | R$ 110,00 |
| 22  | Luciana Martins | Recife | Reflexologia, Massagem, Aromaterapia | R$ 145,00 |
| 21  | Marcos Ferreira | Salvador | Tai Chi, Acupuntura, Meditação | R$ 190,00 |
| 20  | Fernanda Rocha | Florianópolis | Reiki, Cristaloterapia | R$ 170,00 |
| 19  | Roberto Alves | São Paulo | Pilates Holístico, Yoga | R$ 130,00 |
| 18  | Patrícia Mendes | Brasília | Florais, Reiki, Meditação | R$ 140,00 |
| 17  | Juliana Lima | Porto Alegre | Massagem, Reflexologia, Aromaterapia | R$ 160,00 |
| 16  | Carlos Oliveira | Curitiba | Aromaterapia, Cristaloterapia, Reiki | R$ 180,00 |
| 15  | Ana Costa | Belo Horizonte | Yoga, Meditação, Tai Chi | R$ 120,00 |
| 14  | João Santos | Rio de Janeiro | Acupuntura, Massagem | R$ 200,00 |
| 13  | Maria Silva | São Paulo | Reiki, Meditação, Florais | R$ 150,00 |

---

## 🔐 Autenticação

**Status:** ❌ Todos os endpoints são públicos (sem autenticação necessária)

Headers básicos:
```
Content-Type: application/json
Accept: application/json
```

---

## 📝 Formatos de Resposta

### ✅ Sucesso (200 OK)
```json
{
  "count": 12,
  "next": null,
  "previous": null,
  "results": [...]
}
```

### ❌ Não Encontrado (404)
```json
{
  "detail": "Not found."
}
```

### ❌ Erro de Validação (400)
```json
{
  "field": ["error message"]
}
```

---

## 🚀 Quick Postman Setup

1. **Create New Environment** com variável:
   - Key: `base_url`
   - Value: `holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com`

2. **Use em URLs:**
   ```
   {{base_url}}/api/v1/professionals/
   {{base_url}}/api/v1/professionals/24/
   {{base_url}}/api/v1/professionals/service_types/
   ```

3. **Common Params:**
   - Param: `service` → Value: `Reiki`
   - Param: `city` → Value: `São Paulo`
   - Param: `price_min` → Value: `100`
   - Param: `price_max` → Value: `200`
   - Param: `attendance_type` → Value: `online`

---

## ✨ Está tudo pronto! 
**Copie qualquer URL acima e cole no Postman!** 🎯

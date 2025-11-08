# 📮 Postman Collection - Setup & Usage

## 🚀 Quick Start

### 1. Importar Collection no Postman

1. Abra o Postman
2. Clique em **File** → **Import**
3. Selecione `HolisticMatch-API.postman_collection.json`
4. Collection será importada com todos os endpoints

### 2. Configurar Variáveis

A collection já vem com as variáveis configuradas:

- **base_url**: `localhost:8000` (padrão - local)
- **access_token**: Deixe em branco (preenchido automaticamente)

#### Para Testar em Produção:
Mude a variável `base_url` para:
```
holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com
```

---

## 📋 Endpoints Disponíveis

### 📋 PROFISSIONAIS (GET)

#### 1. Listar Todos
```
GET /api/v1/professionals/
```
Retorna lista paginada (12 por página)

#### 2-4. Filtrar por Serviço
```
GET /api/v1/professionals/?service=Reiki
GET /api/v1/professionals/?service=Yoga
GET /api/v1/professionals/?service=Meditação
```

#### 5-8. Filtrar por Estado
```
GET /api/v1/professionals/?state=SP
GET /api/v1/professionals/?state=RJ
GET /api/v1/professionals/?state=MG
GET /api/v1/professionals/?state=BA
```

#### 9-12. Filtrar por Preço
```
GET /api/v1/professionals/?price_min=50&price_max=150
GET /api/v1/professionals/?price_min=100&price_max=300
GET /api/v1/professionals/?attendance_type=online
GET /api/v1/professionals/?attendance_type=presencial
```

#### 13-14. Detalhes
```
GET /api/v1/professionals/{id}/
GET /api/v1/professionals/999/  # Erro 404 (teste)
```

---

### 📝 AUTENTICAÇÃO (POST)

#### 1. Registrar Novo Profissional (Com Foto)
```
POST /api/v1/professionals/register/
Content-Type: multipart/form-data
```

**Body (form-data):**
```
email: profissional@example.com
full_name: João Silva
password: SenhaForte123!
services: ["Reiki", "Meditação"]
price_per_session: 150
attendance_type: online
state: SP
city: São Paulo
neighborhood: Centro
bio: Reikiano experiente com 10 anos de prática
whatsapp: 11999999999
photo: [SELECIONE UMA IMAGEM]
```

**⚠️ IMPORTANTE - Como adicionar a foto no Postman:**

1. Na aba **Body**, selecione **form-data**
2. Vá para o campo **photo** (tipo: **File**)
3. Clique em **Select File** e escolha uma imagem (JPG ou PNG, máx 5MB)
4. Clique **Send**

**Response (201 Created):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLC...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLC...",
  "user_id": 1,
  "professional_id": 1,
  "professional": {
    "id": 1,
    "name": "João Silva",
    "email": "profissional@example.com",
    "photo_url": "https://bucket-s3-url/...",
    ...
  }
}
```

#### 2. Registrar Profissional (Sem Foto)
```
POST /api/v1/professionals/register/
```
Mesmo que acima, mas deixe o campo **photo** vazio

#### 3. Verificar Email
```
POST /api/v1/professionals/verify-email/
Content-Type: application/json
```

**Body:**
```json
{
  "token": "seu-token-de-verificacao-aqui"
}
```

---

### 🔧 UTILITÁRIOS

#### Health Check
```
GET /health/
```
Retorna status da API

#### Admin Panel
```
GET /admin/
```
Acesso ao painel administrativo Django

---

## 🎯 Como Testar Foto Upload

### Passo 1: Preparar uma Imagem
- Use uma imagem JPG ou PNG
- Tamanho: máx 5MB
- Qualidade: qualquer uma

### Passo 2: Abrir Postman
1. Vá para a requisição: **"1. Registrar Novo Profissional (Com Foto)"**
2. Clique na aba **Body**
3. Certifique-se que está selecionado **form-data**

### Passo 3: Adicionar a Foto
1. Scroll down até encontrar o campo **photo**
2. Mude o tipo de **text** para **File** (dropdown à direita)
3. Clique em **Select File**
4. Escolha uma imagem do seu computador

### Passo 4: Preencher Dados
1. Altere os valores dos campos conforme desejar:
   - email (único)
   - full_name
   - password (mín 8 caracteres, maiúscula, número)
   - services (JSON array)
   - etc

### Passo 5: Enviar
1. Clique **Send**
2. Verifique a response:
   - **201 Created** ✅ Sucesso!
   - **400 Bad Request** ❌ Validação falhou
   - **413 Payload Too Large** ❌ Arquivo muito grande

### Passo 6: Verificar Upload
1. Vá para o teste de listagem: **"1. Listar Todos"**
2. Clique **Send**
3. Procure pelo profissional que acabou de criar
4. Verifique o campo `photo_url` - deve conter URL do S3

---

## 🔍 Troubleshooting

### ❌ Erro: "PPERM: insecure file access outside working directory"

**Causa**: Arquivo selecionado está em diretório restrito

**Solução**: 
- Copie a imagem para `C:\Users\{seu-usuario}\Downloads\`
- Selecione a imagem a partir de lá

### ❌ Erro 400: "Not a valid string"

**Causa**: Arquivo não é uma imagem válida

**Solução**:
- Use JPG ou PNG
- Verifique se o arquivo não está corrompido

### ❌ Erro 413: "Request Entity Too Large"

**Causa**: Arquivo muito grande (>250MB)

**Solução**:
- Comprima a imagem
- Use ferramenta online: tinypng.com
- Reduza resolução

### ❌ "connect ECONNREFUSED 127.0.0.1:8000"

**Causa**: Django server não está rodando

**Solução**:
```bash
cd backend
python manage.py runserver 0.0.0.0:8000
```

### ❌ Erro 404 em Produção

**Causa**: URL base incorreta

**Solução**:
- Mude `base_url` para: `holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com`
- NÃO inclua `http://` ou `/api/v1`

---

## 📊 Campos Disponíveis para Serviços

```json
[
  "Reiki",
  "Meditação",
  "Yoga",
  "Pilates",
  "Acupuntura",
  "Aromaterapia",
  "Massagem",
  "Terapia Holística",
  "Cristaloterapia",
  "Florais"
]
```

---

## 🌍 Estados Disponíveis

Todos os 27 estados brasileiros + DF:

- **SP** - São Paulo
- **RJ** - Rio de Janeiro
- **MG** - Minas Gerais
- **BA** - Bahia
- **RS** - Rio Grande do Sul
- **PE** - Pernambuco
- **CE** - Ceará
- **PA** - Pará
- **PR** - Paraná
- **SC** - Santa Catarina
- **GO** - Goiás
- **PB** - Paraíba
- **MA** - Maranhão
- **ES** - Espírito Santo
- **PI** - Piauí
- **RN** - Rio Grande do Norte
- **AL** - Alagoas
- **MT** - Mato Grosso
- **DF** - Distrito Federal
- **MS** - Mato Grosso do Sul
- **AC** - Acre
- **AM** - Amazonas
- **AP** - Amapá
- **RO** - Rondônia
- **RR** - Roraima
- **TO** - Tocantins
- **SE** - Sergipe

---

## ✅ Checklist de Teste Completo

- [ ] Listar profissionais (GET)
- [ ] Filtrar por serviço (GET)
- [ ] Filtrar por estado (GET)
- [ ] Registrar sem foto (POST)
- [ ] Registrar com foto (POST)
- [ ] Verificar se foto foi para S3
- [ ] Testar com imagem grande (>5MB) → deve falhar
- [ ] Testar localmente (localhost:8000)
- [ ] Testar em produção (AWS)

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do Django: `python manage.py runserver`
2. Verifique os logs do Nginx no AWS
3. Confirme que S3 está configurado corretamente

---

**Última atualização**: Nov 8, 2025 ✅

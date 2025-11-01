# 📖 Como Usar os Endpoints - Guia Rápido

## 🎯 Você tem 4 arquivos pronto para usar:

### 1️⃣ **POSTMAN_QUICK.md** ⭐ COMECE POR AQUI!
   - URLs prontas pra copiar e colar
   - Tabela de dados de teste
   - Exemplos rápidos

### 2️⃣ **POSTMAN_ENDPOINTS.md** 📚 Documentação Completa
   - Descrição detalhada de cada endpoint
   - Todos os parâmetros explicados
   - Exemplos de request e response

### 3️⃣ **HolisticMatch-API.postman_collection.json** 📥 Importar no Postman
   - Arquivo pronto para importar no Postman Desktop
   - 14 requests pré-configuradas
   - Variáveis de ambiente incluídas

### 4️⃣ **CURL_TESTS.sh** 🖥️ Para Terminal/PowerShell
   - Exemplos de testes via cURL
   - Testes de performance (ab, wrk)
   - Testes com jq (JSON parsing)

---

## 🚀 Como Começar

### Opção A: Usar no Postman (Recomendado)

1. **Abra o Postman**
2. **File → Import**
3. **Selecione:** `HolisticMatch-API.postman_collection.json`
4. **Configure a variável:**
   - Clique na engrenagem (Settings)
   - Selecione "Manage Environments"
   - Na variável `base_url`, mude para:
     - **Produção:** `holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com`
     - **Local:** `localhost:8000`
5. **Comece a testar!** Click em qualquer request

---

### Opção B: Copiar URLs para o Browser/Postman

1. **Abra `POSTMAN_QUICK.md`**
2. **Copie qualquer URL dos testes rápidos**
3. **Cole no Postman ou no Browser**

Exemplo:
```
GET http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/
```

---

### Opção C: Usar via PowerShell/Terminal

1. **Abra PowerShell ou Terminal**
2. **Copie comandos de `CURL_TESTS.sh`**

Exemplo:
```powershell
curl.exe "http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/" | ConvertFrom-Json | jq '.results[0]'
```

---

## 📝 URLs Rápidas (Copie e Cole)

### Base URL
```
http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com
```

### Endpoints

| Nome | URL |
|------|-----|
| **Listar Todos** | `/api/v1/professionals/` |
| **Um Profissional** | `/api/v1/professionals/{id}/` |
| **Serviços** | `/api/v1/professionals/service_types/` |

### Exemplos Completos

```
✅ Todos os profissionais:
http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/

✅ Filtrar Yoga:
http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/?service=Yoga

✅ Online até R$150:
http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/?attendance_type=online&price_max=150

✅ Profissional ID 24:
http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/24/

✅ Tipos de serviço:
http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/service_types/
```

---

## 🔍 Query Parameters (Filtros)

Você pode combinar quantos quiser:

```
?service=Reiki              # Filtrar por tipo de serviço
?city=São Paulo             # Filtrar por cidade
?state=SP                   # Filtrar por estado
?price_min=100              # Preço mínimo (R$)
?price_max=200              # Preço máximo (R$)
?attendance_type=online     # online, presencial, ambos
?limit=20                   # Itens por página
?offset=12                  # Paginação
```

### Exemplos Combinados

```
# Reiki em SP entre R$100-200
?service=Reiki&state=SP&price_min=100&price_max=200

# Yoga online com até R$150
?service=Yoga&attendance_type=online&price_max=150

# Próximos 5 resultados
?limit=5&offset=5
```

---

## 📊 IDs dos Profissionais para Teste

```
24  → André Souza
23  → Beatriz Silva
22  → Luciana Martins
21  → Marcos Ferreira
20  → Fernanda Rocha
19  → Roberto Alves
18  → Patrícia Mendes
17  → Juliana Lima
16  → Carlos Oliveira
15  → Ana Costa
14  → João Santos
13  → Maria Silva
```

---

## ✨ Tipos de Serviço

```
Reiki
Acupuntura
Aromaterapia
Massagem
Meditação Guiada
Tai Chi
Reflexologia
Cristaloterapia
Florais
Yoga
Pilates Holístico
```

---

## ✅ Testes Recomendados

### 1️⃣ Teste de Conectividade
```
Clique em: Listar Todos
Espera: Status 200 com 12 profissionais
```

### 2️⃣ Teste de Filtro
```
Clique em: Filtrar por Serviço (Reiki)
Espera: Status 200 com profissionais que oferecem Reiki
```

### 3️⃣ Teste de Detalhes
```
Clique em: Detalhes Profissional (ID 24)
Espera: Status 200 com dados de André Souza
```

### 4️⃣ Teste de Erro
```
Clique em: Erro 404 (ID não existe)
Espera: Status 404 com mensagem "Not found"
```

### 5️⃣ Teste de Serviços
```
Clique em: Listar Tipos de Serviço
Espera: Status 200 com array de 11 serviços
```

---

## 🔒 Autenticação

**Status:** ❌ Nenhuma autenticação necessária
Todos os endpoints são públicos!

---

## 🆘 Troubleshooting

| Problema | Solução |
|----------|---------|
| **Timeout** | Backend pode estar down. Tente: `eb status` |
| **404 Not Found** | Verifique se o ID existe (13-24) |
| **Conexão recusada** | Verifique a URL da base_url |
| **Sem resultados no filtro** | Verifique a ortografia (case-sensitive em alguns filtros) |

---

## 📚 Documentação Completa

Para informações detalhadas sobre cada endpoint, veja:
- **`POSTMAN_ENDPOINTS.md`** - Documentação completa com exemplos de resposta

---

## 🎯 Próximos Passos

1. **Abra `POSTMAN_QUICK.md`** e teste as URLs rápidas
2. **Importe `HolisticMatch-API.postman_collection.json`** no Postman
3. **Combine filtros** para buscar dados específicos
4. **Compartilhe os endpoints** com seu time!

---

✅ **Pronto para testar?** Comece com POSTMAN_QUICK.md! 🚀

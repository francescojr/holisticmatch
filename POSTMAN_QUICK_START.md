# 🚀 Quick Start: Testando Upload de Foto no Postman (PRODUÇÃO)

## ✅ O que foi atualizado

A collection do Postman agora tem:

1. ✅ **Todos os endpoints GET** (listagem, filtros, detalhes)
2. ✅ **POST /register/** (registrar profissional COM foto)
3. ✅ **POST /register/** (registrar profissional SEM foto)  
4. ✅ **POST /verify-email/** (verificar email)
5. ✅ **Configurado para PRODUÇÃO** (AWS)

---

## 🎯 Teste Rápido (5 minutos)

### Passo 1: Importar a Collection

1. Copie o arquivo: `HolisticMatch-API.postman_collection.json`
2. Abra Postman → File → Import
3. Selecione o arquivo

---

### Passo 2: Pronto para Testar

✅ Collection já está configurada para **PRODUÇÃO**

URL: `holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com`

Você não precisa mudar nada!

---

### Passo 3: Abrir Postman e Testar

**Test 1 - GET Simples (verificar conexão)**

1. Vá para: **Profissionais** → **1. Listar Todos**
2. Clique **Send**
3. Deve retornar **200 OK** com lista de profissionais de produção

---

**Test 2 - POST com Foto**

1. Vá para: **Autenticação** → **1. Registrar Novo Profissional (Com Foto)**

2. Clique na aba **Body**

3. Procure o campo **photo** (last field)

4. Mude de **Text** para **File** (dropdown):
   ```
   [Tipo] ← mude isso de "text" para "file"
   ```

5. Clique em **Select File** e escolha uma imagem JPG/PNG

6. Mude o email para algo **ÚNICO** (ex: `teste-seus-unique-id@example.com`)

7. Clique **Send**

8. Se vir **201 Created** ✅ Sucesso! Foto foi para S3!

---

### Passo 4: Verificar se a Foto foi para o S3

1. Vá para: **Profissionais** → **1. Listar Todos**
2. Clique **Send**
3. Procure o profissional que criou
4. Verifique se tem `photo_url` com URL do S3

Exemplo de response com foto:
```json
{
  "id": 1,
  "name": "João Silva",
  "photo_url": "https://seu-bucket-s3.amazonaws.com/photos/...",
  ...
}
```

---

## 🔴 Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| `413 Payload Too Large` | Arquivo >250MB | Comprima a imagem |
| `400 Bad Request` | Email já existe ou dados inválidos | Use email ÚNICO |
| `404 Not Found` | URL base errada | Confirme em Postman variables |
| `Foto não aparece em photo_url` | S3 não salvou | Verifique logs AWS |

---

## 📸 Campos do Formulário de Registro

```
email*                  : seu-email-UNICO@example.com
password*              : MínimOito123! (8+ chars, maiúscula, número)
full_name*             : João Silva
services*              : ["Reiki", "Yoga"] (JSON array)
price_per_session*     : 150 (número)
attendance_type*       : "online" ou "presencial"
state*                 : "SP" (2 letras)
city*                  : "São Paulo"
neighborhood*          : "Centro"
bio*                   : "Descrição da experiência"
whatsapp*              : "11999999999"
photo                  : [imagem JPG/PNG] (opcional)
```

\* = Obrigatório

---

## ✅ Checklist antes de Testar

- [ ] Postman aberto
- [ ] Collection importada
- [ ] Variável `base_url` = `holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com`
- [ ] Tem uma imagem JPG/PNG pronta
- [ ] Email que vai usar é ÚNICO (novo)
- [ ] Senha tem 8+ caracteres, maiúscula e número

---

## 🎬 Resumo Visual

```
Postman (PRODUÇÃO)
  ├─ Autenticação
  │  ├─ 1. Registrar (Com Foto) ← CLIQUE AQUI
  │  │   └─ Body → form-data → photo → Select File
  │  ├─ 2. Registrar (Sem Foto)
  │  └─ 3. Verificar Email
  │
  ├─ Profissionais
  │  ├─ 1. Listar Todos ← Veja resultado aqui
  │  ├─ 2-4. Filtrar por Serviço
  │  ├─ 5-8. Filtrar por Estado
  │  └─ 13. Detalhes {id}
  │
  └─ Utilitários
     ├─ Health Check
     └─ Admin Panel
```

---

## 🌐 URL de Produção

```
https://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/
```

Todos os endpoints são HTTPS ✅

---

## 🎉 Pronto!

Agora você pode:

✅ Testar todos os GET endpoints em PRODUÇÃO
✅ Registrar profissionais COM foto
✅ Upload de foto vai direto para S3 AWS em PRODUÇÃO
✅ Verificar se a foto aparece em photo_url

**Tudo funcionando online!** 🚀

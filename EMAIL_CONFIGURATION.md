# 📧 Guia de Configuração de Email - SendGrid

## Problema Atual
- ✅ Registro funciona
- ✅ API retorna tokens
- ❌ Email de verificação NÃO CHEGA (usando console.EmailBackend)

## Solução: SendGrid (FREE)

### 1. Criar Conta SendGrid
1. Vá para https://sendgrid.com
2. Crie uma conta (FREE: 100 emails/dia)
3. Faça login
4. Menu → Settings → API Keys
5. Clique "Create API Key"
6. Nome: `holisticmatch-api`
7. Copie a chave

### 2. Configurar no Backend

**Arquivo: `backend/.env`**

```bash
# Email Settings - SendGrid
EMAIL_BACKEND=sendgrid_backend.SendgridBackend
SENDGRID_API_KEY=SG.sua_chave_aqui_123456...
DEFAULT_FROM_EMAIL=noreply@holisticmatch.com.br
```

**Arquivo: `backend/requirements.txt` - ADICIONAR:**
```
sendgrid==6.11.0
```

### 3. Instalar a Dependência

```bash
pip install sendgrid==6.11.0
```

### 4. Atualizar settings.py

**Arquivo: `backend/config/settings.py`**

```python
# Email settings - SendGrid
EMAIL_BACKEND = config(
    'EMAIL_BACKEND',
    default='sendgrid_backend.SendgridBackend'
)
DEFAULT_FROM_EMAIL = config(
    'DEFAULT_FROM_EMAIL', 
    default='noreply@holisticmatch.com.br'
)
```

### 5. Deploy

```bash
git add .
git commit -m "CONFIG: Add SendGrid email configuration"
git push origin main
eb deploy
```

### 6. Teste

- Vá para **RegisterPage → Step 2**
- Complete o registro
- Você receberá um email com o link de verificação ✅

---

## ⚠️ ALTERNATIVA RÁPIDA (Console Backend para MVP)

Se não quiser configurar SendGrid agora, os emails aparecem no **Console/Logs**:

1. `eb ssh` (conecta na instância)
2. `tail -f /var/log/eb-engine.log` (vê os emails no log)
3. Copie o link de verificação do log
4. Cole no navegador

---

## Testando Localmente

```bash
# 1. Instale SendGrid
pip install sendgrid

# 2. Configure .env
EMAIL_BACKEND=sendgrid_backend.SendgridBackend
SENDGRID_API_KEY=SG.sua_chave...

# 3. Rode o servidor
python manage.py runserver

# 4. Registre um usuário no Postman
POST http://localhost:8000/api/v1/professionals/register/

# 5. Você receberá um email real!
```

---

## 🚀 Resumo

| Item | Status | Ação |
|------|--------|------|
| Registro | ✅ Funciona | Nada |
| Tokens | ✅ Retorna | Nada |
| Email | ❌ Console | Configura SendGrid |
| Verificação | ⏳ Aguarda email | Após SendGrid |

**Próximo passo?** Configure o SendGrid e faça deploy! 🚀

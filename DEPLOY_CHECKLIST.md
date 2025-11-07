# PRONTO PARA DEPLOY - CHECKLIST

## Mudanças Aplicadas ✅

- [x] `backend/.ebextensions/nginx_upload.config` - 250MB limit + timeouts
- [x] `backend/config/settings.py` - 250MB limits  
- [x] `frontend/src/services/api.ts` - Axios header fix + 30s timeout
- [x] `frontend/` - npm run build (compilada)
- [x] `CHANGELOG.md` - Atualizado
- [x] `README.md` - Atualizado

## Testes Disponíveis ✅

```bash
# Teste 1: Bash (Linux/Mac)
./test_photo.sh https://seu-backend.com

# Teste 2: Python (Qualquer OS)
python test_api_direct.py https://seu-backend.com

# Teste 3: Manual (Browser)
https://holisticmatch.vercel.app/register
# Preencha com foto 2-5MB, clique Próximo, clique Registrar
# Esperado: Email verification screen (201 Created)
```

## Deploy Steps

### Step 1: Deploy Backend (3-5 min)
```bash
cd backend
eb deploy holisticmatch-env
```

Verifica:
- Nginx config aplicada
- Django limits atualizados
- Gunicorn reiniciado

### Step 2: Deploy Frontend (1-2 min)
```bash
cd frontend
npm run build
git push origin main  # Auto-deploy para Vercel
```

Ou:
```bash
vercel --prod
```

## Verificação Pós-Deploy

1. **Limpar cache**: Ctrl+Shift+Delete ou use incógnito
2. **Testar upload**: 
   - https://holisticmatch.vercel.app/register
   - Foto real de 2-5MB
   - Step 1 → Step 2 → Registrar
3. **Esperado**: Email verification (sucesso)
4. **NÃO esperado**: 400 ou 413 error

## Se der erro

**400 Bad Request "not a file"**:
- Frontend não foi atualizada
- Limpe cache e recarregue
- Verifique: DevTools → Network → POST request
- Deve mostrar multipart/form-data no Content-Type (não application/json)

**413 Request Entity Too Large**:
- Nginx config não foi aplicada
- Redeploy backend com: `eb deploy`
- Espere 3-5 minutos
- Teste novamente

**500 Internal Server Error**:
- Check: `eb logs holisticmatch-env | tail -100`
- Look for: Parser errors ou ImageField errors

## Arquivos Importantes

```
ROOT:
├── PHOTO_UPLOAD_QUICKSTART.md        ← Leia primeiro
├── PHOTO_UPLOAD_STATUS.md            ← Status atual
├── CHANGELOG.md                      ← Mudanças detalhadas
├── README.md                         ← Atualizado
├── test_photo.sh                     ← Teste bash
├── test_api_direct.py               ← Teste Python
├── test_photo_upload.ps1            ← Teste PowerShell
└── _claudio/                         ← Docs detalhadas
    ├── PHOTO_FIX_COMPLETE_ANALYSIS.md
    ├── PHOTO_UPLOAD_FIX_FINAL.md
    ├── FOTO_UPLOAD_SOLUCAO_PT.md
    └── ... (outros docs)

BACKEND:
├── .ebextensions/
│   ├── nginx_upload.config          ← MODIFICADO
│   └── django.config
├── config/
│   └── settings.py                  ← MODIFICADO
└── ...

FRONTEND:
├── src/services/
│   ├── api.ts                       ← MODIFICADO
│   └── ...
└── dist/                            ← COMPILADO
```

## Resumo Final

✅ Nginx: 50MB → 250MB  
✅ Django: 50MB → 250MB  
✅ Axios: Header fix + 30s timeout  
✅ Frontend: Compilada  
✅ Testes: Prontos  
✅ Docs: Atualizados  

**Status**: 🟢 READY FOR PRODUCTION

---

**Próximo**: Deploy! 🚀

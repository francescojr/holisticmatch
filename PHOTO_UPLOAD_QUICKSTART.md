# PHOTO UPLOAD FIX - QUICK START

## O que foi corrigido

3 mudanças simples:
1. **Nginx**: 50MB → 250MB
2. **Django**: 50MB → 250MB  
3. **Axios**: Remove Content-Type header para FormData

## Deploy

### Backend
```bash
cd backend
eb deploy holisticmatch-env
```

### Frontend
```bash
cd frontend
npm run build
git push  # Auto-deploy para Vercel
```

## Testar

### Option 1: PowerShell (Windows)
```powershell
.\test_photo_upload.ps1 -Backend "https://seu-backend.com"
```

### Option 2: Bash (Linux/Mac)
```bash
./test_photo.sh https://seu-backend.com
```

### Option 3: Python
```bash
python test_api_direct.py https://seu-backend.com
```

## Teste Manual

1. https://holisticmatch.vercel.app/register
2. Preencha Step 1 com foto (2-5MB)
3. Clique Próximo
4. Preencha Step 2
5. Clique Registrar
6. **Esperado**: Email verification screen
7. **NÃO esperado**: 400 ou 413 error

## Arquivos Modificados

```
backend/.ebextensions/nginx_upload.config
backend/config/settings.py
frontend/src/services/api.ts
```

## Status

✅ Tudo pronto para produção

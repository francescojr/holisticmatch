# 🔐 Adicionar GitHub Secret - RESEND_API_KEY

## Passo a Passo

### 1. Vá para GitHub
```
https://github.com/francescojr/holisticmatch/settings/secrets/actions
```

### 2. Clique "New repository secret"

### 3. Preencha:
```
Name: RESEND_API_KEY
Secret: <Seu Resend API Key>
```

### 4. Clique "Add secret"

---

## ✅ Verificação

Depois de adicionar, você verá:
- ✅ RESEND_API_KEY (com asteriscos ***)
- ✅ AWS_ACCESS_KEY_ID (já existe)
- ✅ AWS_SECRET_ACCESS_KEY (já existe)
- ✅ DJANGO_SECRET_KEY (já existe)

---

## 🚀 O Que Acontece Depois

1. **CI/CD Automático**: Quando fizer push, GitHub Actions usa RESEND_API_KEY
2. **Testes Executam**: Com email funcionando
3. **Deploy Automático**: Para AWS EB com email configurado
4. **Produção**: Emails via Resend

---

## ⏱️ Próximas Ações

1. ✅ Adicionar secret no GitHub (faça manualmente)
2. ⏳ Rodar `bash configure_eb_env.sh` (ou `eb setenv` manualmente)
3. ⏳ Fazer novo push para disparar deploy
4. ⏳ Testar registro → Email chega ✅

Link rápido: https://github.com/francescojr/holisticmatch/settings/secrets/actions

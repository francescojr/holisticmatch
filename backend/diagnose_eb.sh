#!/bin/bash
# Diagnóstico da API HolisticMatch - Execute na instância EB

echo "====== DIAGNÓSTICO HOLISTICMATCH ======"
echo "Timestamp: $(date)"
echo ""

echo "1. STATUS DO PROCESSO GUNICORN:"
ps aux | grep gunicorn | grep -v grep || echo "  ⚠️  Gunicorn não está rodando!"

echo ""
echo "2. PORTA 8000 LISTENING:"
netstat -tlnp 2>/dev/null | grep 8000 || echo "  ⚠️  Nenhum processo na porta 8000"

echo ""
echo "3. CONEXÃO COM BANCO DE DADOS:"
cd /var/app/current
source /var/app/venv/*/bin/activate
python -c "
from django.db import connection
try:
    with connection.cursor() as cursor:
        cursor.execute('SELECT 1')
    print('  ✅ Banco de dados: CONECTADO')
except Exception as e:
    print(f'  ❌ Erro de conexão: {e}')
"

echo ""
echo "4. VARIÁVEIS DE AMBIENTE CRÍTICAS:"
env | grep -E "(DATABASE_URL|AWS_|DEBUG|SECRET_KEY|DJANGO)" | head -20

echo ""
echo "5. LOGS RECENTES DO NGINX:"
tail -20 /var/log/nginx/error.log

echo ""
echo "6. LOGS RECENTES DO GUNICORN:"
tail -20 /var/log/elasticbeanstalk/web.stdout.log 2>/dev/null || echo "  Log não encontrado"

echo ""
echo "====== FIM DO DIAGNÓSTICO ======"

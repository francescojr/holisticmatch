#!/bin/bash
cd /var/app/current/backend

echo '📊 Antes da limpeza:'
PYCC_BEFORE=$(find . -type f -name '*.pyc' 2>/dev/null | wc -l)
PYCACHE_BEFORE=$(find . -type d -name '__pycache__' 2>/dev/null | wc -l)
echo "   - Arquivos .pyc: $PYCC_BEFORE"
echo "   - Diretórios __pycache__: $PYCACHE_BEFORE"

echo ''
echo '🧹 Limpando cache...'
find . -type f -name '*.pyc' -delete 2>/dev/null
find . -type d -name '__pycache__' -exec rm -rf {} + 2>/dev/null || true

echo '✅ Cache limpo'
echo ''

echo '📊 Depois da limpeza:'
PYCC_AFTER=$(find . -type f -name '*.pyc' 2>/dev/null | wc -l)
PYCACHE_AFTER=$(find . -type d -name '__pycache__' 2>/dev/null | wc -l)
echo "   - Arquivos .pyc: $PYCC_AFTER"
echo "   - Diretórios __pycache__: $PYCACHE_AFTER"

echo ''
echo '🔄 Reiniciando Gunicorn...'
sudo systemctl restart gunicorn
sleep 3

echo '✅ Gunicorn reiniciado'
echo ''

echo '🧪 Testando API...'
curl -s http://localhost:8000/api/v1/professionals/ 2>/dev/null | grep -o '"is_active":[^,]*' | head -2 || echo "⚠️  API ainda está iniciando"

echo ''
echo '✨ Limpeza e reinicialização concluídas!'

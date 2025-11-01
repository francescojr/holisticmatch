#!/bin/bash
# HolisticMatch API - Testes via cURL
# Copie e cole os comandos abaixo no seu terminal

# ============================================
# 🔧 CONFIGURAÇÃO
# ============================================

BASE_URL="http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com"
# ou localmente: BASE_URL="http://localhost:8000"

# ============================================
# 1️⃣ LISTAR TODOS OS PROFISSIONAIS
# ============================================

curl -X GET "$BASE_URL/api/v1/professionals/" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"

# ============================================
# 2️⃣ LISTAR COM FILTRO: Serviço
# ============================================

curl -X GET "$BASE_URL/api/v1/professionals/?service=Reiki" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"

# ============================================
# 3️⃣ LISTAR COM FILTRO: Localização
# ============================================

curl -X GET "$BASE_URL/api/v1/professionals/?city=São Paulo" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"

# ============================================
# 4️⃣ LISTAR COM FILTRO: Estado
# ============================================

curl -X GET "$BASE_URL/api/v1/professionals/?state=SP" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"

# ============================================
# 5️⃣ LISTAR COM FILTRO: Tipo de Atendimento
# ============================================

# online
curl -X GET "$BASE_URL/api/v1/professionals/?attendance_type=online" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"

# presencial
curl -X GET "$BASE_URL/api/v1/professionals/?attendance_type=presencial" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"

# ambos
curl -X GET "$BASE_URL/api/v1/professionals/?attendance_type=ambos" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"

# ============================================
# 6️⃣ LISTAR COM FILTRO: Faixa de Preço
# ============================================

# Mínimo R$ 100
curl -X GET "$BASE_URL/api/v1/professionals/?price_min=100" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"

# Máximo R$ 200
curl -X GET "$BASE_URL/api/v1/professionals/?price_max=200" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"

# Entre R$ 100 e R$ 200
curl -X GET "$BASE_URL/api/v1/professionals/?price_min=100&price_max=200" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"

# ============================================
# 7️⃣ LISTAR COM MÚLTIPLOS FILTROS
# ============================================

# Filtrar: Yoga em São Paulo entre R$ 100-150
curl -X GET "$BASE_URL/api/v1/professionals/?service=Yoga&city=São Paulo&price_min=100&price_max=150" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"

# Filtrar: Reiki, online, até R$ 150
curl -X GET "$BASE_URL/api/v1/professionals/?service=Reiki&attendance_type=online&price_max=150" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"

# ============================================
# 8️⃣ PAGINAÇÃO
# ============================================

# Primeiros 5 resultados
curl -X GET "$BASE_URL/api/v1/professionals/?limit=5&offset=0" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"

# Próximos 5 resultados
curl -X GET "$BASE_URL/api/v1/professionals/?limit=5&offset=5" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"

# 20 resultados por página
curl -X GET "$BASE_URL/api/v1/professionals/?limit=20&offset=0" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"

# ============================================
# 9️⃣ DETALHE DE UM PROFISSIONAL
# ============================================

# ID 24 (André Souza)
curl -X GET "$BASE_URL/api/v1/professionals/24/" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"

# ID 23 (Beatriz Silva)
curl -X GET "$BASE_URL/api/v1/professionals/23/" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"

# ============================================
# 🔟 LISTAR TIPOS DE SERVIÇO
# ============================================

curl -X GET "$BASE_URL/api/v1/professionals/service_types/" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"

# ============================================
# 📊 TESTES DE RESPOSTA COM JQ (JSON)
# ============================================

# Mostrar apenas nomes dos profissionais
curl -s "$BASE_URL/api/v1/professionals/" | jq '.results[].name'

# Mostrar apenas o primeiro profissional
curl -s "$BASE_URL/api/v1/professionals/" | jq '.results[0]'

# Contar total de profissionais
curl -s "$BASE_URL/api/v1/professionals/" | jq '.count'

# Listar todos os serviços (sem duplicatas)
curl -s "$BASE_URL/api/v1/professionals/" | jq '.results[].services[]' | sort -u

# ============================================
# ❌ TESTES DE ERRO (esperando 404)
# ============================================

# Profissional que não existe
curl -X GET "$BASE_URL/api/v1/professionals/999/" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"

# ============================================
# ⚡ TESTE DE VELOCIDADE
# ============================================

# Com timing (-w)
curl -w "\nTempo total: %{time_total}s\n" \
  -X GET "$BASE_URL/api/v1/professionals/" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"

# ============================================
# 🔍 TESTE DETALHADO COM HEADERS
# ============================================

# -v = verbose (mostra headers de request e response)
curl -v "$BASE_URL/api/v1/professionals/" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"

# ============================================
# 📱 TESTE EM FORMATO BONITO (com pretty print)
# ============================================

curl -s "$BASE_URL/api/v1/professionals/" | jq '.'

# ============================================
# 💾 SALVAR RESPOSTA EM ARQUIVO
# ============================================

# Salvar resultado em JSON
curl -s "$BASE_URL/api/v1/professionals/" > professionals.json

# Salvar com formatação
curl -s "$BASE_URL/api/v1/professionals/" | jq '.' > professionals.json

# ============================================
# 🚀 TESTE DE CONCORRÊNCIA (ab - Apache Bench)
# ============================================

# 100 requisições com 10 concorrentes
ab -n 100 -c 10 "$BASE_URL/api/v1/professionals/"

# ============================================
# 📈 TESTE COM WRK (mais realista)
# ============================================

# 4 threads, 10 conexões, por 30 segundos
wrk -t4 -c10 -d30s "$BASE_URL/api/v1/professionals/"

# ============================================
# 🎯 EXEMPLOS PRONTOS PARA COPIAR E COLAR
# ============================================

# Test 1: Simple list
curl "http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/" | jq '.count'

# Test 2: Professionals in São Paulo
curl "http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/?city=São Paulo" | jq '.results[].name'

# Test 3: Yoga professionals
curl "http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/?service=Yoga" | jq '.results | length'

# Test 4: Online specialists up to R$150
curl "http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/?attendance_type=online&price_max=150" | jq '.results[].name'

# Test 5: Service types available
curl "http://holisticmatch-env.eba-cthmhjpa.us-east-2.elasticbeanstalk.com/api/v1/professionals/service_types/" | jq '.'

echo "✅ Testes prontos! Execute o comando acima em seu terminal."

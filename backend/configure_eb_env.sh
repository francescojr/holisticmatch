#!/bin/bash
# Script para configurar variáveis de ambiente no AWS Elastic Beanstalk
# Uso: bash configure_eb_env.sh

set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Configurando variáveis de ambiente no AWS EB...${NC}"

# Verificar se eb cli está instalado
if ! command -v eb &> /dev/null; then
    echo -e "${YELLOW}⚠️  EB CLI não está instalado. Instalando...${NC}"
    pip install awsebcli
fi

# Solicitar valores interativos
read -p "📧 RESEND_API_KEY (re_...): " RESEND_API_KEY
read -p "📧 DEFAULT_FROM_EMAIL (default: onboarding@resend.dev): " DEFAULT_FROM_EMAIL
DEFAULT_FROM_EMAIL=${DEFAULT_FROM_EMAIL:-onboarding@resend.dev}
read -p "🌍 FRONTEND_URL (default: https://holisticmatch.vercel.app): " FRONTEND_URL
FRONTEND_URL=${FRONTEND_URL:-https://holisticmatch.vercel.app}

echo -e "${BLUE}📝 Setando variáveis no EB environment...${NC}"

# Configurar variáveis no EB
eb setenv \
  RESEND_API_KEY="$RESEND_API_KEY" \
  DEFAULT_FROM_EMAIL="$DEFAULT_FROM_EMAIL" \
  EMAIL_BACKEND="resend.django.EmailBackend" \
  FRONTEND_URL="$FRONTEND_URL" \
  DEBUG=False

echo -e "${GREEN}✅ Variáveis de ambiente configuradas com sucesso!${NC}"
echo ""
echo -e "${BLUE}📊 Variáveis setadas:${NC}"
echo "  - RESEND_API_KEY: ******* (hidden)"
echo "  - DEFAULT_FROM_EMAIL: $DEFAULT_FROM_EMAIL"
echo "  - EMAIL_BACKEND: resend.django.EmailBackend"
echo "  - FRONTEND_URL: $FRONTEND_URL"
echo ""
echo -e "${YELLOW}⏳ Aguardando aplicação se atualizar (pode levar 2-3 minutos)...${NC}"
eb health --refresh

echo -e "${GREEN}🎉 Setup completo! Emails via Resend estão prontos.${NC}"

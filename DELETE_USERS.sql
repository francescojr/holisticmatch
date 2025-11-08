-- ============================================================================
-- SCRIPT SEGURO PARA DELETAR RESQUÍCIOS - FRANCESCO@HCUNIT.COM.BR E DATAJACK13@GMAIL.COM
-- ============================================================================
-- PostgreSQL (Supabase)
-- 
-- Este script DESABILITA a FK temporariamente pra deletar os orfãos, depois reabilita
-- ============================================================================

BEGIN TRANSACTION;

-- ============================================================================
-- PASSO 1: VERIFICAÇÃO - Ver os RESQUÍCIOS que ficaram
-- ============================================================================

-- Ver se ainda tem auth_user orfãos (sem professional)
SELECT 'ℹ️  USERS ORFÃOS (sem professional):' AS info;
SELECT id, username, email, is_active, date_joined 
FROM auth_user 
WHERE email IN ('francesco@hcunit.com.br', 'datajack13@gmail.com')
  AND id NOT IN (SELECT user_id FROM professionals_professional);

-- Ver se tem professionals orfãos (user deletado)
SELECT 'ℹ️  PROFESSIONALS ORFÃOS (user não existe):' AS info;
SELECT id, name, email, user_id
FROM professionals_professional 
WHERE user_id IN (
    SELECT DISTINCT user_id FROM professionals_professional 
    WHERE user_id NOT IN (SELECT id FROM auth_user)
);

-- Ver TODOS os dados relacionados aos emails (INCLUSIVE os orfãos)
SELECT 'ℹ️  EMAIL VERIFICAÇÃO TOKENS (todos):' AS info;
SELECT id, user_id, token, created_at
FROM professionals_emailverificationtoken 
ORDER BY user_id DESC;

-- ============================================================================
-- PASSO 2: DROPAR FOREIGN KEY (temporariamente)
-- ============================================================================

SELECT 'ℹ️  Dropando FK constraint temporariamente...' AS info;

-- PostgreSQL: encontrar e dropar a constraint
ALTER TABLE professionals_emailverificationtoken 
DROP CONSTRAINT professionals_emailv_user_id_79fa7582_fk_auth_user;

-- ============================================================================
-- PASSO 3: DELEÇÃO - Agora sim vamos deletar tudo
-- ============================================================================

-- Primeiro: deletar email verification tokens (MESMO OS ORFÃOS)
SELECT 'ℹ️  Deletando TODOS email verification tokens...' AS info;
DELETE FROM professionals_emailverificationtoken;

-- Segundo: deletar professionals (mesmo que orfãos)
SELECT 'ℹ️  Deletando TODOS professionals orfãos...' AS info;
DELETE FROM professionals_professional 
WHERE user_id NOT IN (SELECT id FROM auth_user);

-- Terceiro: deletar users
SELECT 'ℹ️  Deletando users dos emails...' AS info;
DELETE FROM auth_user 
WHERE email IN ('francesco@hcunit.com.br', 'datajack13@gmail.com');

-- ============================================================================
-- PASSO 4: RECRIAR FOREIGN KEY
-- ============================================================================

SELECT 'ℹ️  Recriando FK constraint...' AS info;

ALTER TABLE professionals_emailverificationtoken 
ADD CONSTRAINT professionals_emailv_user_id_79fa7582_fk_auth_user 
FOREIGN KEY (user_id) REFERENCES auth_user(id) ON DELETE CASCADE;

-- ============================================================================
-- PASSO 5: VERIFICAÇÃO FINAL
-- ============================================================================

SELECT 'ℹ️  VERIFICAÇÃO FINAL:' AS info;
SELECT 'Users restantes:' AS check, COUNT(*) FROM auth_user WHERE email IN ('francesco@hcunit.com.br', 'datajack13@gmail.com')
UNION ALL
SELECT 'Professionals restantes:', COUNT(*) FROM professionals_professional WHERE user_id NOT IN (SELECT id FROM auth_user)
UNION ALL
SELECT 'Email tokens orfãos:', COUNT(*) FROM professionals_emailverificationtoken WHERE user_id NOT IN (SELECT id FROM auth_user);

-- ============================================================================
-- COMMIT OU ROLLBACK
-- ============================================================================

COMMIT;   -- ✅ Confirma as mudanças

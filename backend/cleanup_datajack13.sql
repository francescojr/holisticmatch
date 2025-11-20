-- Script SQL para limpar email retido: datajack13@gmail.com
-- Execute este script no banco de dados PostgreSQL do HolisticMatch

-- PASSO 1: Encontre o user_id
SELECT id, email, username FROM auth_user WHERE email = 'datajack13@gmail.com';

-- PASSO 2: Copie o ID encontrado e substitua na query abaixo
-- Se o ID for 42, a query fica:
-- DELETE FROM professionals_professional WHERE user_id = 42;
-- DELETE FROM auth_user WHERE id = 42;

-- OU execute tudo de uma vez (substitua {ID} pelo número encontrado):
DELETE FROM professionals_professional WHERE user_id = (SELECT id FROM auth_user WHERE email = 'datajack13@gmail.com');
DELETE FROM auth_user WHERE email = 'datajack13@gmail.com';

-- Verificar se foi deletado (deve retornar vazio):
SELECT id, email FROM auth_user WHERE email = 'datajack13@gmail.com';

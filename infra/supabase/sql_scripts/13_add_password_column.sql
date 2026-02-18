-- ============================================
-- 13 - ADICIONAR COLUNA PASSWORD A PROFILES
-- ============================================

-- Adicionar coluna password
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password TEXT;

-- Atualizar usuários existentes com senhas padrão
UPDATE public.profiles SET password = 'admin123' WHERE email = 'admin@controle.app';
UPDATE public.profiles SET password = 'editor123' WHERE email = 'editor@controle.app';
UPDATE public.profiles SET password = 'viewer123' WHERE email = 'viewer@controle.app';

-- Verificar
SELECT email, name, role, password IS NOT NULL as has_password FROM public.profiles;

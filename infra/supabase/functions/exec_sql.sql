-- ============================================
-- Função para executar SQL dinâmico
-- ATENÇÃO: Use apenas com service role key!
-- ============================================

-- Criar extensão pgcrypto se não existir
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Função para executar SQL (apenas para admin/service role)
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Executar o SQL
  EXECUTE sql;
END;
$$;

-- Comentário explicativo
COMMENT ON FUNCTION public.exec_sql IS 'Executa SQL arbitrário. APENAS para uso administrativo com service role.';

-- Remover permissões de execução para anon e authenticated
REVOKE EXECUTE ON FUNCTION public.exec_sql FROM anon, authenticated;

-- Permitir apenas para service role (implicitamente via SECURITY DEFINER)

-- ============================================
-- 06 - TABELA: SEGREDOS (CREDENCIAIS)
-- Valores sao criptografados no backend
-- ============================================

CREATE TABLE IF NOT EXISTS public.secrets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  secret_type TEXT NOT NULL CHECK (secret_type IN ('api_key', 'ssh_key', 'password', 'token', 'certificate', 'other')),
  label TEXT NOT NULL,
  encrypted_value TEXT NOT NULL,
  iv TEXT NOT NULL,
  auth_tag TEXT,
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  last_rotated_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.secrets IS 'Credenciais e segredos criptografados';

-- Indices
CREATE INDEX IF NOT EXISTS idx_secrets_app ON public.secrets(app_id);
CREATE INDEX IF NOT EXISTS idx_secrets_type ON public.secrets(secret_type);

-- Trigger
CREATE TRIGGER update_secrets_updated_at 
  BEFORE UPDATE ON public.secrets 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS - Mais restritivo para segredos
ALTER TABLE public.secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view secret metadata" 
  ON public.secrets FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "Only editors and admins can manage secrets" 
  ON public.secrets FOR ALL TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  ));

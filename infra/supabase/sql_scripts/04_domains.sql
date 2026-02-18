-- ============================================
-- 04 - TABELA: DOMINIOS
-- ============================================

CREATE TABLE IF NOT EXISTS public.domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  domain_name TEXT NOT NULL,
  registrar TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending', 'suspended')),
  expires_at DATE,
  auto_renew BOOLEAN DEFAULT false,
  dns_provider TEXT,
  ssl_status TEXT DEFAULT 'active' CHECK (ssl_status IN ('active', 'expiring', 'expired', 'none')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.domains IS 'Dominios registrados para as aplicacoes';

-- Indices
CREATE INDEX IF NOT EXISTS idx_domains_app ON public.domains(app_id);
CREATE INDEX IF NOT EXISTS idx_domains_expires ON public.domains(expires_at);

-- Trigger
CREATE TRIGGER update_domains_updated_at 
  BEFORE UPDATE ON public.domains 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view domains" 
  ON public.domains FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "Editors and admins can manage domains" 
  ON public.domains FOR ALL TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  ));

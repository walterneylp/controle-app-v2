-- ============================================
-- 05 - TABELA: INTEGRACOES
-- APIs, IAs, servicos externos
-- ============================================

CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  integration_name TEXT NOT NULL,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('ai', 'payment', 'storage', 'email', 'sms', 'analytics', 'other')),
  scope TEXT,
  api_endpoint TEXT,
  webhook_url TEXT,
  is_active BOOLEAN DEFAULT true,
  monthly_cost DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.integrations IS 'Integracoes com APIs e servicos externos';

-- Indices
CREATE INDEX IF NOT EXISTS idx_integrations_app ON public.integrations(app_id);
CREATE INDEX IF NOT EXISTS idx_integrations_type ON public.integrations(integration_type);

-- Trigger
CREATE TRIGGER update_integrations_updated_at 
  BEFORE UPDATE ON public.integrations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view integrations" 
  ON public.integrations FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "Editors and admins can manage integrations" 
  ON public.integrations FOR ALL TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  ));

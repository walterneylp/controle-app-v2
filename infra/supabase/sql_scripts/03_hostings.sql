-- ============================================
-- 03 - TABELA: HOSPEDAGENS
-- ============================================

CREATE TABLE IF NOT EXISTS public.hostings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  ip_address INET,
  server_type TEXT NOT NULL CHECK (server_type IN ('vps', 'dedicated', 'shared', 'cloud', 'serverless')),
  region TEXT,
  server_name TEXT,
  ssh_port INTEGER DEFAULT 22,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.hostings IS 'Servidores e hospedagens das aplicacoes';

-- Indices
CREATE INDEX IF NOT EXISTS idx_hostings_app ON public.hostings(app_id);
CREATE INDEX IF NOT EXISTS idx_hostings_provider ON public.hostings(provider);

-- Trigger
CREATE TRIGGER update_hostings_updated_at 
  BEFORE UPDATE ON public.hostings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.hostings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view hostings" 
  ON public.hostings FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "Editors and admins can manage hostings" 
  ON public.hostings FOR ALL TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  ));

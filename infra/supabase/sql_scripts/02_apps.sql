-- ============================================
-- 02 - TABELA: APLICACOES (APPS)
-- ============================================

CREATE TABLE IF NOT EXISTS public.apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  commercial_name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  tags TEXT[] DEFAULT '{}',
  owner_id UUID REFERENCES public.profiles(id),
  repository_url TEXT,
  documentation_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id)
);

COMMENT ON TABLE public.apps IS 'Aplicacoes SaaS cadastradas';

-- Indices
CREATE INDEX IF NOT EXISTS idx_apps_status ON public.apps(status);
CREATE INDEX IF NOT EXISTS idx_apps_owner ON public.apps(owner_id);

-- Trigger
CREATE TRIGGER update_apps_updated_at 
  BEFORE UPDATE ON public.apps 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;

-- Politicas
CREATE POLICY "Authenticated users can view apps" 
  ON public.apps FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "Editors and admins can create apps" 
  ON public.apps FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  ));

CREATE POLICY "Editors and admins can update apps" 
  ON public.apps FOR UPDATE TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  ));

CREATE POLICY "Only admins can delete apps" 
  ON public.apps FOR DELETE TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

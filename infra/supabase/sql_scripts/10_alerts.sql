-- ============================================
-- 10 - TABELA: ALERTAS
-- ============================================

CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID REFERENCES public.apps(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('domain_expiry', 'ssl_expiry', 'subscription_renewal', 'secret_rotation', 'missing_data')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.alerts IS 'Alertas automaticos do sistema';

-- Indices
CREATE INDEX IF NOT EXISTS idx_alerts_app ON public.alerts(app_id);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON public.alerts(is_resolved);

-- RLS
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view alerts" 
  ON public.alerts FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "Editors and admins can manage alerts" 
  ON public.alerts FOR ALL TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  ));

-- ============================================
-- 09 - TABELA: LOGS DE AUDITORIA
-- ============================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  user_email TEXT,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'view', 'login', 'logout', 'export')),
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.audit_logs IS 'Registro de auditoria de todas as acoes';

-- Indices
CREATE INDEX IF NOT EXISTS idx_audit_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);

-- RLS - Apenas admins podem ver logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs" 
  ON public.audit_logs FOR SELECT TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "System can insert audit logs" 
  ON public.audit_logs FOR INSERT TO authenticated 
  WITH CHECK (true);

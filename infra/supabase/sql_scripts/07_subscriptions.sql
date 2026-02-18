-- ============================================
-- 07 - TABELA: ASSINATURAS
-- ============================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  plan_name TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'suspended', 'trial')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly', 'one_time')),
  monthly_cost DECIMAL(10,2),
  card_holder_name TEXT,
  card_last4 TEXT,
  card_brand TEXT,
  next_billing_date DATE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.subscriptions IS 'Assinaturas e pagamentos recorrentes';

-- Indices
CREATE INDEX IF NOT EXISTS idx_subscriptions_app ON public.subscriptions(app_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing ON public.subscriptions(next_billing_date);

-- Trigger
CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON public.subscriptions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view subscriptions" 
  ON public.subscriptions FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "Editors and admins can manage subscriptions" 
  ON public.subscriptions FOR ALL TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  ));

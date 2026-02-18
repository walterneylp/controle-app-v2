-- ============================================
-- Controle App v2 - Schema Inicial
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- Tabela: Perfis de Usuário (integração com Auth)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Perfis de usuários do sistema';

-- ============================================
-- Tabela: Aplicações (Apps)
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

COMMENT ON TABLE public.apps IS 'Aplicações/SaaS cadastrados';

-- Índices para apps
CREATE INDEX IF NOT EXISTS idx_apps_status ON public.apps(status);
CREATE INDEX IF NOT EXISTS idx_apps_owner ON public.apps(owner_id);
CREATE INDEX IF NOT EXISTS idx_apps_name ON public.apps USING gin(to_tsvector('portuguese', name || ' ' || COALESCE(commercial_name, '')));

-- ============================================
-- Tabela: Hospedagens
-- ============================================
CREATE TABLE IF NOT EXISTS public.hostings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  ip_address INET,
  type TEXT NOT NULL CHECK (type IN ('vps', 'dedicated', 'shared', 'cloud', 'serverless')),
  region TEXT,
  server_name TEXT,
  ssh_port INTEGER DEFAULT 22,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.hostings IS 'Servidores e hospedagens das aplicações';

CREATE INDEX IF NOT EXISTS idx_hostings_app ON public.hostings(app_id);
CREATE INDEX IF NOT EXISTS idx_hostings_provider ON public.hostings(provider);

-- ============================================
-- Tabela: Domínios
-- ============================================
CREATE TABLE IF NOT EXISTS public.domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  registrar TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending', 'suspended')),
  expires_at DATE,
  auto_renew BOOLEAN DEFAULT false,
  dns_provider TEXT,
  ssl_status TEXT DEFAULT 'active' CHECK (ssl_status IN ('active', 'expiring', 'expired', 'none')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.domains IS 'Domínios registrados para as aplicações';

CREATE INDEX IF NOT EXISTS idx_domains_app ON public.domains(app_id);
CREATE INDEX IF NOT EXISTS idx_domains_expires ON public.domains(expires_at);

-- ============================================
-- Tabela: Integrações (APIs/IAs)
-- ============================================
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ai', 'payment', 'storage', 'email', 'sms', 'analytics', 'other')),
  scope TEXT,
  api_endpoint TEXT,
  webhook_url TEXT,
  is_active BOOLEAN DEFAULT true,
  monthly_cost DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.integrations IS 'Integrações com APIs e serviços externos';

CREATE INDEX IF NOT EXISTS idx_integrations_app ON public.integrations(app_id);
CREATE INDEX IF NOT EXISTS idx_integrations_type ON public.integrations(type);

-- ============================================
-- Tabela: Segredos (Credenciais)
-- ============================================
CREATE TABLE IF NOT EXISTS public.secrets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('api_key', 'ssh_key', 'password', 'token', 'certificate', 'other')),
  label TEXT NOT NULL,
  -- O valor é criptografado no backend antes de ser armazenado
  encrypted_value TEXT NOT NULL,
  iv TEXT NOT NULL, -- Initialization vector para decriptação
  auth_tag TEXT, -- Para AES-GCM
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  last_rotated_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.secrets IS 'Credenciais e segredos criptografados';

CREATE INDEX IF NOT EXISTS idx_secrets_app ON public.secrets(app_id);
CREATE INDEX IF NOT EXISTS idx_secrets_type ON public.secrets(type);

-- ============================================
-- Tabela: Assinaturas
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
  card_last4 TEXT(4),
  card_brand TEXT,
  next_billing_date DATE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.subscriptions IS 'Assinaturas e pagamentos recorrentes';

CREATE INDEX IF NOT EXISTS idx_subscriptions_app ON public.subscriptions(app_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing ON public.subscriptions(next_billing_date);

-- ============================================
-- Tabela: Anexos
-- ============================================
CREATE TABLE IF NOT EXISTS public.attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  storage_bucket TEXT DEFAULT 'attachments',
  description TEXT,
  category TEXT DEFAULT 'other' CHECK (category IN ('documentation', 'contract', 'invoice', 'screenshot', 'other')),
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.attachments IS 'Arquivos anexados às aplicações';

CREATE INDEX IF NOT EXISTS idx_attachments_app ON public.attachments(app_id);
CREATE INDEX IF NOT EXISTS idx_attachments_category ON public.attachments(category);

-- ============================================
-- Tabela: Auditoria (Logs)
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

COMMENT ON TABLE public.audit_logs IS 'Registro de auditoria de todas as ações';

CREATE INDEX IF NOT EXISTS idx_audit_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);

-- ============================================
-- Tabela: Alertas
-- ============================================
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID REFERENCES public.apps(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('domain_expiry', 'ssl_expiry', 'subscription_renewal', 'secret_rotation', 'missing_data')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.alerts IS 'Alertas automáticos do sistema';

CREATE INDEX IF NOT EXISTS idx_alerts_app ON public.alerts(app_id);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON public.alerts(is_resolved);

-- ============================================
-- Funções auxiliares
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_apps_updated_at BEFORE UPDATE ON public.apps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hostings_updated_at BEFORE UPDATE ON public.hostings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_domains_updated_at BEFORE UPDATE ON public.domains
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_secrets_updated_at BEFORE UPDATE ON public.secrets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles (usuários veem apenas seu próprio perfil, admin vê todos)
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para apps (todos os usuários autenticados podem ver, apenas editor/admin pode modificar)
CREATE POLICY "Authenticated users can view apps" ON public.apps
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only editors and admins can create apps" ON public.apps
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

CREATE POLICY "Only editors and admins can update apps" ON public.apps
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

CREATE POLICY "Only admins can delete apps" ON public.apps
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Políticas similares para outras tabelas...
-- (Podemos adicionar mais políticas específicas conforme necessário)

-- ============================================
-- Buckets de Storage
-- ============================================

-- Criar bucket para anexos (executar no console do Supabase)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', false);

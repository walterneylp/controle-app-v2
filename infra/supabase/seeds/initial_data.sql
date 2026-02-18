-- ============================================
-- Controle App v2 - Dados Iniciais (Seed)
-- ============================================

-- Nota: Este seed deve ser executado APÓS criar os usuários no Auth do Supabase
-- Os UUIDs abaixo são exemplos - substitua pelos UUIDs reais dos usuários criados

-- ============================================
-- Perfis de exemplo
-- ============================================
-- Descomente e ajuste os UUIDs conforme os usuários criados no Auth:

/*
INSERT INTO public.profiles (id, email, name, role, created_at, updated_at) VALUES
  ('UUID_DO_ADMIN_AQUI', 'admin@controle.app', 'Administrador', 'admin', NOW(), NOW()),
  ('UUID_DO_EDITOR_AQUI', 'editor@controle.app', 'Editor', 'editor', NOW(), NOW()),
  ('UUID_DO_VIEWER_AQUI', 'viewer@controle.app', 'Visualizador', 'viewer', NOW(), NOW());
*/

-- ============================================
-- Apps de exemplo
-- ============================================
INSERT INTO public.apps (name, commercial_name, description, status, tags, repository_url, created_at, updated_at) VALUES
  ('cliente-portal', 'Cliente Portal', 'Portal de autoatendimento para clientes', 'active', ARRAY['cliente', 'portal', 'saas'], 'https://github.com/empresa/cliente-portal', NOW(), NOW()),
  ('api-gateway', 'API Gateway', 'Gateway centralizado de APIs', 'active', ARRAY['api', 'backend', 'infra'], 'https://github.com/empresa/api-gateway', NOW(), NOW()),
  ('dashboard-analytics', 'Dashboard Analytics', 'Painel de análise de dados', 'active', ARRAY['frontend', 'analytics', 'dashboard'], 'https://github.com/empresa/dashboard', NOW(), NOW()),
  ('mobile-app', 'App Mobile', 'Aplicativo para iOS e Android', 'inactive', ARRAY['mobile', 'app', 'react-native'], 'https://github.com/empresa/mobile-app', NOW(), NOW());

-- ============================================
-- Hospedagens de exemplo
-- ============================================
INSERT INTO public.hostings (app_id, provider, ip_address, type, region, server_name, notes, created_at, updated_at)
SELECT 
  a.id,
  CASE (ROW_NUMBER() OVER (ORDER BY a.id)) % 4
    WHEN 0 THEN 'AWS'
    WHEN 1 THEN 'DigitalOcean'
    WHEN 2 THEN 'Hetzner'
    ELSE 'Vercel'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.id)) % 4
    WHEN 0 THEN '54.123.45.67'::inet
    WHEN 1 THEN '167.99.12.34'::inet
    WHEN 2 THEN '95.216.123.45'::inet
    ELSE NULL
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.id)) % 4
    WHEN 0 THEN 'cloud'
    WHEN 1 THEN 'vps'
    WHEN 2 THEN 'dedicated'
    ELSE 'serverless'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.id)) % 4
    WHEN 0 THEN 'us-east-1'
    WHEN 1 THEN 'nyc1'
    WHEN 2 THEN 'hel1'
    ELSE 'global'
  END,
  'server-' || (ROW_NUMBER() OVER (ORDER BY a.id)),
  'Servidor principal ' || a.name,
  NOW(),
  NOW()
FROM public.apps a
LIMIT 3;

-- ============================================
-- Domínios de exemplo
-- ============================================
INSERT INTO public.domains (app_id, domain, registrar, status, expires_at, auto_renew, ssl_status, created_at, updated_at)
SELECT 
  a.id,
  CASE a.name
    WHEN 'cliente-portal' THEN 'portal.cliente.com.br'
    WHEN 'api-gateway' THEN 'api.empresa.com'
    WHEN 'dashboard-analytics' THEN 'analytics.empresa.com'
    ELSE 'app-' || a.id || '.com'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY a.id)) % 3
    WHEN 0 THEN 'Registro.br'
    WHEN 1 THEN 'Cloudflare'
    ELSE 'Namecheap'
  END,
  'active',
  CURRENT_DATE + INTERVAL '1 year',
  true,
  'active',
  NOW(),
  NOW()
FROM public.apps a
LIMIT 3;

-- ============================================
-- Integrações de exemplo
-- ============================================
INSERT INTO public.integrations (app_id, provider, name, type, scope, is_active, monthly_cost, created_at, updated_at)
VALUES
  ((SELECT id FROM public.apps WHERE name = 'cliente-portal' LIMIT 1), 'OpenAI', 'OpenAI GPT-4', 'ai', 'text-generation', true, 20.00, NOW(), NOW()),
  ((SELECT id FROM public.apps WHERE name = 'cliente-portal' LIMIT 1), 'Stripe', 'Stripe Payments', 'payment', 'payments,subscriptions', true, 0.00, NOW(), NOW()),
  ((SELECT id FROM public.apps WHERE name = 'api-gateway' LIMIT 1), 'AWS', 'AWS S3', 'storage', 'object-storage', true, 15.00, NOW(), NOW()),
  ((SELECT id FROM public.apps WHERE name = 'dashboard-analytics' LIMIT 1), 'Google', 'Google Analytics', 'analytics', 'tracking', true, 0.00, NOW(), NOW()),
  ((SELECT id FROM public.apps WHERE name = 'api-gateway' LIMIT 1), 'SendGrid', 'SendGrid Email', 'email', 'transactional', true, 19.95, NOW(), NOW());

-- ============================================
-- Assinaturas de exemplo
-- ============================================
INSERT INTO public.subscriptions (app_id, provider, plan_name, status, billing_cycle, monthly_cost, card_holder_name, card_last4, card_brand, next_billing_date, created_at, updated_at)
VALUES
  ((SELECT id FROM public.apps WHERE name = 'cliente-portal' LIMIT 1), 'AWS', 'Business Support', 'active', 'monthly', 150.00, 'EMPRESA LTDA', '4242', 'visa', CURRENT_DATE + INTERVAL '1 month', NOW(), NOW()),
  ((SELECT id FROM public.apps WHERE name = 'api-gateway' LIMIT 1), 'Vercel', 'Pro', 'active', 'monthly', 20.00, 'EMPRESA LTDA', '4242', 'visa', CURRENT_DATE + INTERVAL '15 days', NOW(), NOW()),
  ((SELECT id FROM public.apps WHERE name = 'dashboard-analytics' LIMIT 1), 'Supabase', 'Pro', 'active', 'monthly', 25.00, 'EMPRESA LTDA', '4242', 'visa', CURRENT_DATE + INTERVAL '7 days', NOW(), NOW());

-- ============================================
-- Anexos de exemplo
-- ============================================
INSERT INTO public.attachments (app_id, file_name, original_name, mime_type, size_bytes, storage_path, description, category, created_at)
VALUES
  ((SELECT id FROM public.apps WHERE name = 'cliente-portal' LIMIT 1), 'doc-arquitetura.pdf', 'Arquitetura.pdf', 'application/pdf', 2048576, 'apps/cliente-portal/doc-arquitetura.pdf', 'Documento de arquitetura do sistema', 'documentation', NOW()),
  ((SELECT id FROM public.apps WHERE name = 'api-gateway' LIMIT 1), 'contrato.pdf', 'Contrato.pdf', 'application/pdf', 1048576, 'apps/api-gateway/contrato.pdf', 'Contrato de serviço', 'contract', NOW()),
  ((SELECT id FROM public.apps WHERE name = 'dashboard-analytics' LIMIT 1), 'screenshot.png', 'Dashboard.png', 'image/png', 512000, 'apps/dashboard-analytics/screenshot.png', 'Screenshot do dashboard', 'screenshot', NOW());

-- ============================================
-- Alertas de exemplo
-- ============================================
INSERT INTO public.alerts (app_id, type, severity, title, description, created_at)
VALUES
  ((SELECT id FROM public.apps WHERE name = 'cliente-portal' LIMIT 1), 'domain_expiry', 'medium', 'Domínio expira em 30 dias', 'O domínio portal.cliente.com.br expira em 30 dias', NOW()),
  ((SELECT id FROM public.apps WHERE name = 'api-gateway' LIMIT 1), 'subscription_renewal', 'low', 'Renovação em breve', 'A assinatura da Vercel será renovada em 15 dias', NOW()),
  ((SELECT id FROM public.apps WHERE name = 'dashboard-analytics' LIMIT 1), 'missing_data', 'high', 'Dados incompletos', 'A aplicação não possui hospedagem cadastrada', NOW());

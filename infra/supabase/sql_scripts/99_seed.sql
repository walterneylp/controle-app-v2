-- ============================================
-- 99 - DADOS INICIAIS (SEED)
-- Execute apos criar os usuarios no Auth
-- ============================================

-- IMPORTANTE: Substitua os UUIDs abaixo pelos IDs reais dos usuarios criados no Auth
-- Voce pode encontrar os UUIDs em: Authentication -> Users

-- Exemplo (substitua pelos UUIDs corretos):
-- '11111111-1111-1111-1111-111111111111' -> admin
-- '22222222-2222-2222-2222-222222222222' -> editor  
-- '33333333-3333-3333-3333-333333333333' -> viewer

/*
-- Criar perfis para usuarios existentes no Auth
INSERT INTO public.profiles (id, email, name, role, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', email),
  COALESCE(raw_app_meta_data->>'role', 'viewer'),
  NOW(),
  NOW()
FROM auth.users
WHERE email IN ('admin@controle.app', 'editor@controle.app', 'viewer@controle.app')
ON CONFLICT (id) DO NOTHING;
*/

-- Apps de exemplo
INSERT INTO public.apps (name, commercial_name, description, status, tags, created_at, updated_at)
VALUES
  ('cliente-portal', 'Cliente Portal', 'Portal de autoatendimento', 'active', ARRAY['cliente', 'portal'], NOW(), NOW()),
  ('api-gateway', 'API Gateway', 'Gateway centralizado de APIs', 'active', ARRAY['api', 'backend'], NOW(), NOW()),
  ('dashboard', 'Dashboard Analytics', 'Painel de analise', 'active', ARRAY['frontend', 'analytics'], NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Dominios de exemplo
INSERT INTO public.domains (app_id, domain_name, registrar, status, expires_at, auto_renew, created_at, updated_at)
SELECT 
  id,
  name || '.empresa.com',
  'Cloudflare',
  'active',
  CURRENT_DATE + INTERVAL '1 year',
  true,
  NOW(),
  NOW()
FROM public.apps
WHERE name IN ('cliente-portal', 'api-gateway')
ON CONFLICT DO NOTHING;

-- Integracoes de exemplo
INSERT INTO public.integrations (app_id, provider, integration_name, integration_type, is_active, created_at, updated_at)
SELECT 
  a.id,
  'Stripe',
  'Stripe Payments',
  'payment',
  true,
  NOW(),
  NOW()
FROM public.apps a
WHERE a.name = 'cliente-portal'
ON CONFLICT DO NOTHING;

INSERT INTO public.integrations (app_id, provider, integration_name, integration_type, is_active, created_at, updated_at)
SELECT 
  a.id,
  'OpenAI',
  'OpenAI GPT-4',
  'ai',
  true,
  NOW(),
  NOW()
FROM public.apps a
WHERE a.name = 'cliente-portal'
ON CONFLICT DO NOTHING;

-- Assinaturas de exemplo
INSERT INTO public.subscriptions (app_id, provider, plan_name, status, billing_cycle, monthly_cost, card_holder_name, card_last4, next_billing_date, created_at, updated_at)
SELECT 
  id,
  'AWS',
  'Business',
  'active',
  'monthly',
  150.00,
  'Empresa LTDA',
  '4242',
  CURRENT_DATE + INTERVAL '1 month',
  NOW(),
  NOW()
FROM public.apps
WHERE name = 'api-gateway'
ON CONFLICT DO NOTHING;

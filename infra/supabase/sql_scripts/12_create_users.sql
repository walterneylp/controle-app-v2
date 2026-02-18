-- ============================================
-- 12 - CRIAR USUARIOS COM ROLES VIA SQL
-- 
-- Execute este script APOS executar 00-11
-- Isso cria os usuarios automaticamente com as roles corretas
-- ============================================

-- IMPORTANTE: Se os emails ja existirem, o script vai apenas atualizar as roles

-- Criar funcao auxiliar para criar usuario (se nao existir)
CREATE OR REPLACE FUNCTION create_user_with_role(
  user_email TEXT,
  user_password TEXT,
  user_role TEXT,
  user_name TEXT
)
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Verificar se usuario ja existe
  SELECT id INTO new_user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF new_user_id IS NOT NULL THEN
    -- Atualizar role do usuario existente
    UPDATE auth.users 
    SET raw_app_meta_data = jsonb_build_object('role', user_role),
        raw_user_meta_data = jsonb_build_object('name', user_name),
        email_confirmed_at = NOW()
    WHERE id = new_user_id;
    
    RAISE NOTICE 'Usuario % atualizado com role %', user_email, user_role;
  ELSE
    -- Criar novo usuario
    new_user_id := extensions.uuid_generate_v4();
    
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      confirmation_token,
      email_change_token_new,
      recovery_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      user_email,
      crypt(user_password, gen_salt('bf')),
      NOW(),
      jsonb_build_object('role', user_role),
      jsonb_build_object('name', user_name),
      NOW(),
      NOW(),
      'authenticated',
      '',
      '',
      ''
    );
    
    RAISE NOTICE 'Usuario % criado com ID % e role %', user_email, new_user_id, user_role;
  END IF;
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CRIAR OS 3 USUARIOS DE EXEMPLO
-- ============================================

DO $$
DECLARE
  admin_id UUID;
  editor_id UUID;
  viewer_id UUID;
BEGIN
  -- Criar Admin
  admin_id := create_user_with_role(
    'admin@controle.app',
    'admin123',
    'admin',
    'Administrador'
  );
  
  -- Criar Editor
  editor_id := create_user_with_role(
    'editor@controle.app',
    'editor123',
    'editor',
    'Editor'
  );
  
  -- Criar Viewer
  viewer_id := create_user_with_role(
    'viewer@controle.app',
    'viewer123',
    'viewer',
    'Visualizador'
  );
  
  -- Criar perfis na tabela public.profiles
  INSERT INTO public.profiles (id, email, name, role, created_at, updated_at)
  VALUES
    (admin_id, 'admin@controle.app', 'Administrador', 'admin', NOW(), NOW()),
    (editor_id, 'editor@controle.app', 'Editor', 'editor', NOW(), NOW()),
    (viewer_id, 'viewer@controle.app', 'Visualizador', 'viewer', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    updated_at = NOW();
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'USUARIOS CRIADOS/ATUALIZADOS:';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Admin ID: %', admin_id;
  RAISE NOTICE 'Editor ID: %', editor_id;
  RAISE NOTICE 'Viewer ID: %', viewer_id;
  RAISE NOTICE '';
  RAISE NOTICE 'Logins:';
  RAISE NOTICE '  admin@controle.app / admin123';
  RAISE NOTICE '  editor@controle.app / editor123';
  RAISE NOTICE '  viewer@controle.app / viewer123';
  RAISE NOTICE '========================================';
END $$;

-- Limpar funcao auxiliar
DROP FUNCTION IF EXISTS create_user_with_role;

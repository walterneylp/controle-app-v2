import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: './apps/backend/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createUser(email, password, role, name) {
  // Criar usuário no auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
    app_metadata: { role }
  });
  
  if (authError) {
    if (authError.message.includes('already been registered')) {
      // Usuário já existe, buscar ID
      const { data: users } = await supabase.auth.admin.listUsers();
      const existing = users.users.find(u => u.email === email);
      if (existing) {
        // Atualizar metadata
        await supabase.auth.admin.updateUserById(existing.id, {
          user_metadata: { name },
          app_metadata: { role }
        });
        console.log('Atualizado:', email, existing.id);
        return existing.id;
      }
    }
    console.error('Erro ao criar', email, authError.message);
    return null;
  }
  
  console.log('Criado:', email, authData.user.id);
  return authData.user.id;
}

async function main() {
  console.log('Criando usuários no Supabase...\n');
  
  const adminId = await createUser('admin@controle.app', 'admin123', 'admin', 'Administrador');
  const editorId = await createUser('editor@controle.app', 'editor123', 'editor', 'Editor');
  const viewerId = await createUser('viewer@controle.app', 'viewer123', 'viewer', 'Visualizador');
  
  // Criar profiles
  if (adminId || editorId || viewerId) {
    const profiles = [];
    if (adminId) profiles.push({ id: adminId, email: 'admin@controle.app', name: 'Administrador', role: 'admin' });
    if (editorId) profiles.push({ id: editorId, email: 'editor@controle.app', name: 'Editor', role: 'editor' });
    if (viewerId) profiles.push({ id: viewerId, email: 'viewer@controle.app', name: 'Visualizador', role: 'viewer' });
    
    for (const p of profiles) {
      const { error } = await supabase.from('profiles').upsert(p, { onConflict: 'id' });
      if (error) console.error('Erro profile', p.email, error.message);
      else console.log('Profile OK:', p.email);
    }
  }
  
  console.log('\n✅ Concluído!');
}

main();

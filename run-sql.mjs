import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config({ path: './apps/backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', supabaseUrl);
console.log('Key existe:', !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Verificar conexão
  const { data: testData, error: testError } = await supabase.from('profiles').select('count');
  console.log('Teste conexão:', testData, testError?.message);
  
  // Listar profiles
  const { data: profiles } = await supabase.from('profiles').select('*');
  console.log('Profiles atuais:', profiles?.length || 0);
  
  if (!profiles || profiles.length === 0) {
    console.log('Inserindo usuários...');
    const users = [
      { email: 'admin@controle.app', name: 'Administrador', role: 'admin', password: 'admin123' },
      { email: 'editor@controle.app', name: 'Editor', role: 'editor', password: 'editor123' },
      { email: 'viewer@controle.app', name: 'Visualizador', role: 'viewer', password: 'viewer123' }
    ];
    
    for (const u of users) {
      const id = crypto.randomUUID();
      console.log('Criando:', u.email);
      const { data, error } = await supabase.from('profiles').insert({
        id,
        email: u.email,
        name: u.name,
        role: u.role,
        password: u.password
      }).select();
      if (error) console.error('  Erro:', error.message);
      else console.log('  OK:', data?.[0]?.email);
    }
  }
  
  // Verificar novamente
  const { data: finalProfiles } = await supabase.from('profiles').select('*');
  console.log('\nTotal profiles:', finalProfiles?.length || 0);
  finalProfiles?.forEach(p => console.log(' -', p.email, p.role));
}

run();

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: './apps/backend/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase.from('profiles').select('*');
  console.log('Profiles encontrados:', data?.length || 0);
  if (data) data.forEach(u => console.log('-', u.email, u.role, u.id));
  if (error) console.error('Error:', error.message);
}

check();

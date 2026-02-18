import { supabaseAdmin } from "../integrations/supabase.js";

async function setupDatabase() {
  if (!supabaseAdmin) {
    console.error("❌ Supabase não configurado");
    process.exit(1);
  }

  console.log("🔧 Verificando banco de dados...\n");

  // Verificar se coluna password existe
  const { data: columns, error: colError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .limit(1);

  if (colError) {
    console.error("❌ Erro ao verificar schema:", colError);
    process.exit(1);
  }

  const sample = columns?.[0];
  const hasPassword = sample && "password" in sample;
  
  console.log("Colunas da tabela profiles:", sample ? Object.keys(sample).join(", ") : "N/A");
  console.log("");

  if (!hasPassword) {
    console.log("⚠️  Coluna 'password' NÃO encontrada!");
    console.log("");
    console.log("📋 Execute este SQL no seu banco PostgreSQL:");
    console.log("═══════════════════════════════════════════════════════");
    console.log("");
    console.log("ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password TEXT;");
    console.log("");
    console.log("UPDATE public.profiles SET password = 'admin123' WHERE email = 'admin@controle.app';");
    console.log("UPDATE public.profiles SET password = 'editor123' WHERE email = 'editor@controle.app';");
    console.log("UPDATE public.profiles SET password = 'viewer123' WHERE email = 'viewer@controle.app';");
    console.log("");
    console.log("═══════════════════════════════════════════════════════");
    console.log("");
    console.log("💡 Como executar:");
    console.log("   - Acesse o console PostgreSQL do seu servidor");
    console.log("   - Ou use: psql -U postgres -d seu_banco -f script.sql");
    console.log("");
    process.exit(1);
  }

  console.log("✅ Coluna password existe\n");

  // Verificar usuários
  const { data: profiles } = await supabaseAdmin.from("profiles").select("*");
  console.log(`📊 ${profiles?.length || 0} perfis encontrados:\n`);

  profiles?.forEach(p => {
    console.log(`  ${p.password ? "✅" : "❌"} ${p.email} (${p.role})`);
  });

  console.log("\n✅ Banco configurado corretamente!");
  process.exit(0);
}

setupDatabase();

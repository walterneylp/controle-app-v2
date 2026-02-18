#!/usr/bin/env node
/**
 * Script interativo para configurar o banco de dados Supabase
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

console.log("🗄️  Setup do Banco de Dados - Controle App v2\n");

// Verificar se migrations existem
const migrationsDir = path.join(root, "infra", "supabase", "migrations");
const seedsDir = path.join(root, "infra", "supabase", "seeds");

if (!fs.existsSync(migrationsDir)) {
  console.error("❌ Diretório de migrations não encontrado");
  process.exit(1);
}

const migrations = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql"));
console.log(`📂 Encontradas ${migrations.length} migration(s):`);
migrations.forEach(m => console.log(`   - ${m}`));

console.log("\n📋 Instruções de configuração:\n");

console.log("1️⃣  Acesse o Supabase:");
console.log("   URL: https://crm.apogeuautomacao.ia.br/project/default\n");

console.log("2️⃣  Vá em SQL Editor → New Query e execute:\n");

// Mostrar conteúdo das migrations
migrations.forEach((migration, index) => {
  const content = fs.readFileSync(path.join(migrationsDir, migration), "utf8");
  console.log(`   === ${migration} ===`);
  console.log(content.slice(0, 500) + (content.length > 500 ? "\n..." : ""));
  console.log("\n");
});

console.log("3️⃣  Crie os usuários no Auth:");
console.log("   Vá em Authentication → Users → Add User");
console.log("   - admin@controle.app");
console.log("   - editor@controle.app");
console.log("   - viewer@controle.app\n");

console.log("4️⃣  Configure as variáveis de ambiente no backend:");
console.log("   Copie apps/backend/.env.example para apps/backend/.env");
console.log("   E preencha com suas credenciais do Supabase\n");

console.log("5️⃣  Para popular com dados de teste, execute o seed:");
const seedFile = path.join(seedsDir, "initial_data.sql");
if (fs.existsSync(seedFile)) {
  console.log("   === initial_data.sql ===");
  console.log(fs.readFileSync(seedFile, "utf8").slice(0, 800) + "\n...\n");
}

console.log("\n✅ Setup concluído!");
console.log("\nPróximos passos:");
console.log("  1. Execute as migrations no SQL Editor do Supabase");
console.log("  2. Configure o .env do backend");
console.log("  3. npm run dev:backend");
console.log("  4. npm run dev:frontend");

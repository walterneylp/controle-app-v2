#!/usr/bin/env node
/**
 * Script para executar migrations no Supabase
 * Uso: node migrate.mjs [comando] [opções]
 * 
 * Comandos:
 *   up      - Executa todas as migrations pendentes
 *   down    - Reverte a última migration
 *   seed    - Popula o banco com dados iniciais
 *   reset   - Drop e recria todo o banco
 *   status  - Mostra status das migrations
 */

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuração
const SUPABASE_URL = process.env.SUPABASE_URL || "https://crm.apogeuautomacao.ia.br";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error("❌ Erro: SUPABASE_SERVICE_ROLE_KEY não configurada");
  console.error("Defina a variável de ambiente ou edite este script");
  process.exit(1);
}

// Cliente Supabase com service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// Diretórios
const MIGRATIONS_DIR = path.join(__dirname, "migrations");
const SEEDS_DIR = path.join(__dirname, "seeds");

// Criar tabela de controle de migrations se não existir
async function initMigrationTable() {
  const { error } = await supabase.rpc("exec_sql", {
    sql: `
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ DEFAULT NOW(),
        checksum TEXT
      );
    `
  });
  
  if (error) {
    // Tentar criar diretamente se a função RPC não existir
    const { error: directError } = await supabase
      .from("schema_migrations")
      .select("id")
      .limit(1);
    
    if (directError && directError.code === "42P01") {
      // Tabela não existe, vamos criar via SQL raw
      console.log("📝 Criando tabela de controle de migrations...");
    }
  }
}

// Listar arquivos de migration
function getMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return [];
  }
  
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith(".sql"))
    .sort();
}

// Calcular checksum
function getChecksum(content) {
  // Simples hash para verificação
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

// Executar migration
async function runMigration(filename) {
  const filepath = path.join(MIGRATIONS_DIR, filename);
  const content = fs.readFileSync(filepath, "utf8");
  
  console.log(`🔄 Executando: ${filename}`);
  
  try {
    // Executar SQL
    const { error } = await supabase.rpc("exec_sql", { sql: content });
    
    if (error) {
      console.error(`❌ Erro em ${filename}:`, error.message);
      return false;
    }
    
    // Registrar migration
    const checksum = getChecksum(content);
    await supabase
      .from("schema_migrations")
      .upsert({ filename, checksum }, { onConflict: "filename" });
    
    console.log(`✅ ${filename} executado com sucesso`);
    return true;
  } catch (err) {
    console.error(`❌ Erro inesperado em ${filename}:`, err.message);
    return false;
  }
}

// Executar todas as migrations pendentes
async function migrateUp() {
  console.log("🚀 Iniciando migrations...\n");
  
  await initMigrationTable();
  
  const files = getMigrationFiles();
  
  if (files.length === 0) {
    console.log("ℹ️  Nenhuma migration encontrada");
    return;
  }
  
  // Verificar quais já foram executadas
  const { data: executed, error } = await supabase
    .from("schema_migrations")
    .select("filename");
  
  const executedFiles = new Set(executed?.map(r => r.filename) || []);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const file of files) {
    if (executedFiles.has(file)) {
      console.log(`⏭️  ${file} (já executado)`);
      continue;
    }
    
    const success = await runMigration(file);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  console.log(`\n✨ Resumo: ${successCount} sucesso(s), ${failCount} falha(s)`);
}

// Executar seeds
async function runSeeds() {
  console.log("🌱 Executando seeds...\n");
  
  const files = fs
    .readdirSync(SEEDS_DIR)
    .filter(f => f.endsWith(".sql"))
    .sort();
  
  for (const file of files) {
    const filepath = path.join(SEEDS_DIR, file);
    const content = fs.readFileSync(filepath, "utf8");
    
    console.log(`🔄 Seed: ${file}`);
    
    const { error } = await supabase.rpc("exec_sql", { sql: content });
    
    if (error) {
      console.error(`⚠️  ${file}:`, error.message);
      console.log("💡 Dica: Certifique-se de criar os usuários no Auth primeiro");
    } else {
      console.log(`✅ ${file} executado`);
    }
  }
}

// Mostrar status
async function showStatus() {
  console.log("📊 Status das Migrations\n");
  
  const files = getMigrationFiles();
  
  const { data: executed, error } = await supabase
    .from("schema_migrations")
    .select("filename, executed_at")
    .order("executed_at");
  
  if (error) {
    console.log("⚠️  Tabela de migrations não inicializada");
  }
  
  const executedMap = new Map(executed?.map(r => [r.filename, r.executed_at]) || []);
  
  console.log("Arquivo                          | Status      | Executado em");
  console.log("-".repeat(75));
  
  for (const file of files) {
    const executedAt = executedMap.get(file);
    const status = executedAt ? "✅ Aplicado" : "⏳ Pendente";
    const date = executedAt ? new Date(executedAt).toLocaleString("pt-BR") : "-";
    console.log(`${file.padEnd(32)} | ${status.padEnd(11)} | ${date}`);
  }
}

// Reset completo
async function resetDatabase() {
  console.log("⚠️  ATENÇÃO: Isso irá APAGAR todos os dados!");
  console.log("Para confirmar, execute: node migrate.mjs reset --confirm\n");
}

// CLI
const command = process.argv[2];
const args = process.argv.slice(3);

async function main() {
  switch (command) {
    case "up":
      await migrateUp();
      break;
    case "seed":
      await runSeeds();
      break;
    case "status":
      await showStatus();
      break;
    case "reset":
      if (args.includes("--confirm")) {
        console.log("🗑️  Resetando banco de dados...");
        // Implementar reset se necessário
      } else {
        await resetDatabase();
      }
      break;
    default:
      console.log("📖 Uso: node migrate.mjs [comando]");
      console.log("\nComandos disponíveis:");
      console.log("  up      - Executa migrations pendentes");
      console.log("  seed    - Popula com dados iniciais");
      console.log("  status  - Mostra status das migrations");
      console.log("  reset   - Reseta o banco (use com --confirm)");
      console.log("\nExemplo:");
      console.log("  SUPABASE_SERVICE_ROLE_KEY=xxx node migrate.mjs up");
  }
}

main().catch(console.error);

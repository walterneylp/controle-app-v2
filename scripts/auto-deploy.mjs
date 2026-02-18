#!/usr/bin/env node
/**
 * Script de Deploy Automático
 * 
 * Este script executa:
 * 1. Incrementa o build number
 * 2. Faz build do projeto
 * 3. Cria commit com as alterações
 * 4. Envia para o GitHub
 * 
 * Uso: node scripts/auto-deploy.mjs [mensagem-do-commit]
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// Cores para output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  try {
    return execSync(command, { cwd: root, stdio: "pipe", ...options });
  } catch (error) {
    throw new Error(`Comando falhou: ${command}\n${error.message}`);
  }
}

async function main() {
  const commitMessage = process.argv[2] || "Auto-deploy: update build";
  
  log("\n🚀 INICIANDO DEPLOY AUTOMATICO\n", "cyan");
  
  try {
    // Verificar se há alterações para commitar
    log("📋 Verificando alteracoes...", "blue");
    const status = exec("git status --porcelain").toString();
    
    if (!status.trim()) {
      log("⚠️  Nenhuma alteracao para commitar", "yellow");
      log("   Continuando apenas com o build...\n", "yellow");
    }
    
    // Step 1: Incrementar build
    log("🔢 Incrementando build number...", "blue");
    await import("./bump-build.mjs");
    
    // Ler versão atual
    const metaPath = path.join(root, "build-meta.json");
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    const version = `${meta.major}.${meta.minor}.${meta.build}`;
    
    log(`   ✅ Build ${meta.build} (${version})\n`, "green");
    
    // Step 2: Build
    log("🔨 Compilando projeto...", "blue");
    exec("npm run build", { stdio: "inherit" });
    log("   ✅ Build concluido\n", "green");
    
    // Step 3: Verificar se há algo para commitar (incluindo o build)
    const statusAfterBuild = exec("git status --porcelain").toString();
    
    if (!statusAfterBuild.trim()) {
      log("✅ Nada para commitar. Deploy nao necessario.\n", "green");
      return;
    }
    
    // Step 4: Git add
    log("📦 Adicionando arquivos...", "blue");
    exec("git add .");
    log("   ✅ Arquivos adicionados\n", "green");
    
    // Step 5: Commit
    log("💾 Criando commit...", "blue");
    const fullMessage = `${commitMessage} - Build ${meta.build}`;
    exec(`git commit -m "${fullMessage}"`);
    log(`   ✅ Commit: ${fullMessage}\n`, "green");
    
    // Step 6: Push
    log("☁️  Enviando para GitHub...", "blue");
    exec("git push origin HEAD", { stdio: "inherit" });
    log("   ✅ Push concluido\n", "green");
    
    // Resumo
    log("========================================", "cyan");
    log("✅ DEPLOY AUTOMATICO CONCLUIDO!", "green");
    log("========================================", "cyan");
    log(`Versao: ${version}`, "cyan");
    log(`Build:  ${meta.build}`, "cyan");
    log(`Commit: ${fullMessage}`, "cyan");
    log("========================================\n", "cyan");
    
  } catch (error) {
    log("\n========================================", "red");
    log("❌ ERRO NO DEPLOY", "red");
    log("========================================", "red");
    log(error.message, "red");
    log("========================================\n", "red");
    process.exit(1);
  }
}

main();

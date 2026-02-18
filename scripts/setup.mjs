#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

console.log("🚀 Setup do Controle App v2\n");

// Check Node.js version
try {
  const nodeVersion = process.version;
  console.log(`✅ Node.js ${nodeVersion}`);
} catch {
  console.error("❌ Node.js não encontrado");
  process.exit(1);
}

// Install dependencies
console.log("\n📦 Instalando dependências...");
try {
  execSync("npm install", { cwd: root, stdio: "inherit" });
} catch {
  console.error("❌ Erro ao instalar dependências");
  process.exit(1);
}

// Create .env if not exists
const envPath = path.join(root, "apps", "backend", ".env");
const envExamplePath = path.join(root, "apps", "backend", ".env.example");

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  console.log("\n📝 Criando arquivo .env...");
  fs.copyFileSync(envExamplePath, envPath);
  console.log("✅ .env criado (edite conforme necessário)");
}

// Initial build
console.log("\n🔨 Build inicial...");
try {
  execSync("npm run build", { cwd: root, stdio: "inherit" });
} catch {
  console.error("❌ Erro no build");
  process.exit(1);
}

console.log("\n✅ Setup completo!");
console.log("\nPróximos passos:");
console.log("  npm run dev:backend   # Iniciar backend");
console.log("  npm run dev:frontend  # Iniciar frontend");
console.log("\nOu use Docker:");
console.log("  docker-compose up -d");

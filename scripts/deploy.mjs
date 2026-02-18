import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// Ler versão atual
const metaPath = path.join(root, "build-meta.json");
const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
const version = `v${meta.major}.${meta.minor}.${meta.build}`;

console.log("🚀 Iniciando deploy...");
console.log(`📦 Versão: ${version}`);

try {
  // Verificar se é um repositório git
  const isGitRepo = fs.existsSync(path.join(root, ".git"));
  
  if (!isGitRepo) {
    console.log("📁 Inicializando repositório git...");
    execSync("git init", { cwd: root, stdio: "inherit" });
  }

  // Adicionar todos os arquivos
  console.log("➕ Adicionando arquivos...");
  execSync("git add .", { cwd: root, stdio: "pipe" });

  // Commit
  console.log("💾 Criando commit...");
  try {
    execSync(`git commit -m "Release ${version}"`, { cwd: root, stdio: "pipe" });
  } catch (e) {
    console.log("ℹ️  Nada para commitar ou commit já existe");
  }

  // Verificar remote origin
  try {
    execSync("git remote get-url origin", { cwd: root, stdio: "pipe" });
  } catch {
    console.log("⚠️  Remote 'origin' não configurado.");
    console.log("📝 Configure com: git remote add origin <URL_DO_REPO>");
    process.exit(0);
  }

  // Push
  console.log("☁️  Enviando para GitHub...");
  execSync("git push origin HEAD", { cwd: root, stdio: "inherit" });

  console.log("✅ Deploy concluído com sucesso!");
} catch (error) {
  console.error("❌ Erro no deploy:", error.message);
  process.exit(1);
}

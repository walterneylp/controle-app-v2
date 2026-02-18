import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const metaPath = path.join(root, "build-meta.json");
const outPath = path.join(root, "apps", "frontend", "src", "generated", "buildInfo.ts");

// Ler meta atual
const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
meta.build += 1;

// Timestamp formatado
const now = new Date();
const pad = (n) => String(n).padStart(2, "0");
const dateStamp = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()}-${pad(now.getHours())}.${pad(now.getMinutes())}.${pad(now.getSeconds())}`;

const version = `${meta.major}.${meta.minor}.${meta.build}-${dateStamp}`;

// Salvar meta atualizado
fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n", "utf8");

// Criar diretório se não existir
fs.mkdirSync(path.dirname(outPath), { recursive: true });

// Gerar arquivo TypeScript
const content = `// Auto-generated - Não editar manualmente
export const BUILD_NUMBER = ${meta.build};
export const BUILD_TIMESTAMP = "${dateStamp}";
export const VERSION_LABEL = "${version}";
export const VERSION = { major: ${meta.major}, minor: ${meta.minor}, build: ${meta.build} };
`;

fs.writeFileSync(outPath, content, "utf8");

console.log(`✅ Build incrementado: ${meta.build} (${version})`);

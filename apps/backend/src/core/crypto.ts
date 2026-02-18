import crypto from "node:crypto";
import { env } from "../config/env.js";

// Derivar chave de 32 bytes da chave configurada
const KEY = crypto.scryptSync(env.ENCRYPTION_KEY, "salt", 32);
const ALGORITHM = "aes-256-gcm";

export interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

/**
 * Criptografa um valor usando AES-256-GCM
 */
export function encrypt(plainText: string): EncryptedData {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(plainText, "utf8", "base64");
  encrypted += cipher.final("base64");
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  };
}

/**
 * Descriptografa um valor
 */
export function decrypt(data: EncryptedData): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    KEY,
    Buffer.from(data.iv, "base64")
  );
  
  decipher.setAuthTag(Buffer.from(data.authTag, "base64"));
  
  let decrypted = decipher.update(data.encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}

/**
 * Gera um hash seguro (para senhas ou tokens)
 */
export function hash(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

/**
 * Gera um token aleatório seguro
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

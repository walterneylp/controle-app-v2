import { Router } from "express";
import { z } from "zod";
import { ValidationError, NotFoundError, ForbiddenError } from "../../core/errors.js";
import { requireAuth, requireRole } from "../../core/auth.js";
import type { AuthenticatedRequest } from "../../core/types.js";
import { db } from "../../services/database.js";
import { encrypt, decrypt } from "../../core/crypto.js";

export const secretsRouter = Router();

const createSecretSchema = z.object({
  appId: z.string().uuid("ID do app invalido"),
  secretType: z.enum(["api_key", "ssh_key", "password", "token", "certificate", "other"]),
  label: z.string().min(1, "Rotulo obrigatorio"),
  plainValue: z.string().min(1, "Valor obrigatorio"),
  metadata: z.record(z.any()).default({}),
  expiresAt: z.string().optional(),
});

const updateSecretSchema = z.object({
  plainValue: z.string().min(1, "Valor obrigatorio"),
});

// Listar segredos por app (sem valores)
secretsRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  const appId = req.query.appId as string;
  
  if (!appId) {
    throw new ValidationError("appId obrigatorio");
  }
  
  const secrets = await db.getSecrets(appId);
  
  res.json({
    success: true,
    data: { secrets },
  });
});

// Revelar segredo (apenas admin)
secretsRouter.get("/:id/reveal", requireAuth, requireRole("admin"), async (req: AuthenticatedRequest, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const secret = await db.getSecretById(id);
  
  if (!secret) {
    throw new NotFoundError("Secret");
  }
  
  // Decriptografar valor
  const decryptedValue = decrypt({
    encrypted: secret.encrypted_value,
    iv: secret.iv,
    authTag: secret.auth_tag,
  });
  
  const userAgent = req.headers["user-agent"];
  
  // Registrar auditoria
  await db.createAuditLog({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: "view",
    resourceType: "secret",
    resourceId: id,
    ipAddress: req.ip,
    userAgent: typeof userAgent === 'string' ? userAgent : undefined,
  });
  
  res.json({
    success: true,
    data: { value: decryptedValue },
  });
});

// Criar segredo
secretsRouter.post("/", requireAuth, requireRole("admin", "editor"), async (req: AuthenticatedRequest, res) => {
  const parsed = createSecretSchema.safeParse(req.body);
  
  if (!parsed.success) {
    throw new ValidationError("Dados invalidos", parsed.error.flatten().fieldErrors);
  }
  
  const app = await db.getAppById(parsed.data.appId);
  if (!app) {
    throw new NotFoundError("App");
  }
  
  // Criptografar valor
  const encrypted = encrypt(parsed.data.plainValue);
  
  const secret = await db.createSecret({
    appId: parsed.data.appId,
    secretType: parsed.data.secretType,
    label: parsed.data.label,
    encryptedValue: encrypted.encrypted,
    iv: encrypted.iv,
    authTag: encrypted.authTag,
    metadata: parsed.data.metadata,
    expiresAt: parsed.data.expiresAt,
    createdBy: req.user!.id,
  });
  
  const userAgent = req.headers["user-agent"];
  
  await db.createAuditLog({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: "create",
    resourceType: "secret",
    resourceId: secret.id,
    newData: { ...secret, encryptedValue: undefined },
    ipAddress: req.ip,
    userAgent: typeof userAgent === 'string' ? userAgent : undefined,
  });
  
  res.status(201).json({
    success: true,
    data: { secret },
  });
});

// Atualizar segredo
secretsRouter.put("/:id", requireAuth, requireRole("admin", "editor"), async (req: AuthenticatedRequest, res) => {
  const parsed = updateSecretSchema.safeParse(req.body);
  
  if (!parsed.success) {
    throw new ValidationError("Dados invalidos", parsed.error.flatten().fieldErrors);
  }
  
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const existing = await db.getSecretById(id);
  if (!existing) {
    throw new NotFoundError("Secret");
  }
  
  // Criptografar novo valor
  const encrypted = encrypt(parsed.data.plainValue);
  
  const secret = await db.updateSecret(id, {
    encryptedValue: encrypted.encrypted,
    iv: encrypted.iv,
    authTag: encrypted.authTag,
  });
  
  const userAgent = req.headers["user-agent"];
  
  await db.createAuditLog({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: "update",
    resourceType: "secret",
    resourceId: id,
    ipAddress: req.ip,
    userAgent: typeof userAgent === 'string' ? userAgent : undefined,
  });
  
  res.json({
    success: true,
    data: { secret },
  });
});

// Deletar segredo
secretsRouter.delete("/:id", requireAuth, requireRole("admin"), async (req: AuthenticatedRequest, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const existing = await db.getSecretById(id);
  if (!existing) {
    throw new NotFoundError("Secret");
  }
  
  await db.deleteSecret(id);
  
  const userAgent = req.headers["user-agent"];
  
  await db.createAuditLog({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: "delete",
    resourceType: "secret",
    resourceId: id,
    oldData: existing,
    ipAddress: req.ip,
    userAgent: typeof userAgent === 'string' ? userAgent : undefined,
  });
  
  res.json({
    success: true,
    data: { message: "Segredo deletado com sucesso" },
  });
});

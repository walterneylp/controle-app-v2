import { Router } from "express";
import { z } from "zod";
import { ValidationError, NotFoundError } from "../../core/errors.js";
import { requireAuth, requireRole } from "../../core/auth.js";
import type { AuthenticatedRequest } from "../../core/types.js";
import { db } from "../../services/database.js";

export const domainsRouter = Router();

const createDomainSchema = z.object({
  appId: z.string().uuid("ID do app invalido"),
  domainName: z.string().min(1, "Dominio obrigatorio"),
  registrar: z.string().min(1, "Registrador obrigatorio"),
  status: z.enum(["active", "expired", "pending", "suspended"]).default("active"),
  expiresAt: z.string().optional(),
  autoRenew: z.boolean().default(false),
  dnsProvider: z.string().optional(),
  sslStatus: z.enum(["active", "expiring", "expired", "none"]).default("active"),
});

const updateDomainSchema = createDomainSchema.partial().omit({ appId: true });

// Listar dominios por app
domainsRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  const appId = req.query.appId as string;
  
  if (!appId) {
    throw new ValidationError("appId obrigatorio");
  }
  
  const domains = await db.getDomainsByApp(appId);
  
  res.json({
    success: true,
    data: { domains },
  });
});

// Criar dominio
domainsRouter.post("/", requireAuth, requireRole("admin", "editor"), async (req: AuthenticatedRequest, res) => {
  const parsed = createDomainSchema.safeParse(req.body);
  
  if (!parsed.success) {
    throw new ValidationError("Dados invalidos", parsed.error.flatten().fieldErrors);
  }
  
  const app = await db.getAppById(parsed.data.appId);
  if (!app) {
    throw new NotFoundError("App");
  }
  
  const domain = await db.createDomain(parsed.data);
  
  const userAgent = req.headers["user-agent"];
  
  await db.createAuditLog({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: "create",
    resourceType: "domain",
    resourceId: domain.id,
    newData: domain,
    ipAddress: req.ip,
    userAgent: typeof userAgent === 'string' ? userAgent : undefined,
  });
  
  res.status(201).json({
    success: true,
    data: { domain },
  });
});

// Atualizar dominio
domainsRouter.put("/:id", requireAuth, requireRole("admin", "editor"), async (req: AuthenticatedRequest, res) => {
  const parsed = updateDomainSchema.safeParse(req.body);
  
  if (!parsed.success) {
    throw new ValidationError("Dados invalidos", parsed.error.flatten().fieldErrors);
  }
  
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const existing = await db.getDomainById(id);
  if (!existing) {
    throw new NotFoundError("Domain");
  }
  
  const domain = await db.updateDomain(id, parsed.data);
  
  const userAgent = req.headers["user-agent"];
  
  await db.createAuditLog({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: "update",
    resourceType: "domain",
    resourceId: id,
    oldData: existing,
    newData: domain,
    ipAddress: req.ip,
    userAgent: typeof userAgent === 'string' ? userAgent : undefined,
  });
  
  res.json({
    success: true,
    data: { domain },
  });
});

// Deletar dominio
domainsRouter.delete("/:id", requireAuth, requireRole("admin"), async (req: AuthenticatedRequest, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const existing = await db.getDomainById(id);
  if (!existing) {
    throw new NotFoundError("Domain");
  }
  
  await db.deleteDomain(id);
  
  const userAgent = req.headers["user-agent"];
  
  await db.createAuditLog({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: "delete",
    resourceType: "domain",
    resourceId: id,
    oldData: existing,
    ipAddress: req.ip,
    userAgent: typeof userAgent === 'string' ? userAgent : undefined,
  });
  
  res.json({
    success: true,
    data: { message: "Dominio deletado com sucesso" },
  });
});

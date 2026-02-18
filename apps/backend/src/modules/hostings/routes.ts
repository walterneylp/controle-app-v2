import { Router } from "express";
import { z } from "zod";
import { ValidationError, NotFoundError } from "../../core/errors.js";
import { requireAuth, requireRole } from "../../core/auth.js";
import type { AuthenticatedRequest } from "../../core/types.js";
import { db } from "../../services/database.js";

export const hostingsRouter = Router();

const createHostingSchema = z.object({
  appId: z.string().uuid("ID do app invalido"),
  provider: z.string().min(1, "Provedor obrigatorio"),
  ipAddress: z.string().ip().optional().or(z.literal("")),
  serverType: z.enum(["vps", "dedicated", "shared", "cloud", "serverless"]),
  region: z.string().optional(),
  serverName: z.string().optional(),
  sshPort: z.number().default(22),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
});

const updateHostingSchema = createHostingSchema.partial().omit({ appId: true });

// Listar hostings por app
hostingsRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  const appId = req.query.appId as string;
  
  if (!appId) {
    throw new ValidationError("appId obrigatorio");
  }
  
  const hostings = await db.getHostingsByApp(appId);
  
  res.json({
    success: true,
    data: { hostings },
  });
});

// Criar hosting
hostingsRouter.post("/", requireAuth, requireRole("admin", "editor"), async (req: AuthenticatedRequest, res) => {
  const parsed = createHostingSchema.safeParse(req.body);
  
  if (!parsed.success) {
    throw new ValidationError("Dados invalidos", parsed.error.flatten().fieldErrors);
  }
  
  // Verificar se app existe
  const app = await db.getAppById(parsed.data.appId);
  if (!app) {
    throw new NotFoundError("App");
  }
  
  const hosting = await db.createHosting(parsed.data);
  
  const userAgent = req.headers["user-agent"];
  
  await db.createAuditLog({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: "create",
    resourceType: "hosting",
    resourceId: hosting.id,
    newData: hosting,
    ipAddress: req.ip,
    userAgent: typeof userAgent === 'string' ? userAgent : undefined,
  });
  
  res.status(201).json({
    success: true,
    data: { hosting },
  });
});

// Atualizar hosting
hostingsRouter.put("/:id", requireAuth, requireRole("admin", "editor"), async (req: AuthenticatedRequest, res) => {
  const parsed = updateHostingSchema.safeParse(req.body);
  
  if (!parsed.success) {
    throw new ValidationError("Dados invalidos", parsed.error.flatten().fieldErrors);
  }
  
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const existing = await db.getHostingById(id);
  if (!existing) {
    throw new NotFoundError("Hosting");
  }
  
  const hosting = await db.updateHosting(id, parsed.data);
  
  const userAgent = req.headers["user-agent"];
  
  await db.createAuditLog({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: "update",
    resourceType: "hosting",
    resourceId: id,
    oldData: existing,
    newData: hosting,
    ipAddress: req.ip,
    userAgent: typeof userAgent === 'string' ? userAgent : undefined,
  });
  
  res.json({
    success: true,
    data: { hosting },
  });
});

// Deletar hosting
hostingsRouter.delete("/:id", requireAuth, requireRole("admin"), async (req: AuthenticatedRequest, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const existing = await db.getHostingById(id);
  if (!existing) {
    throw new NotFoundError("Hosting");
  }
  
  await db.deleteHosting(id);
  
  const userAgent = req.headers["user-agent"];
  
  await db.createAuditLog({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: "delete",
    resourceType: "hosting",
    resourceId: id,
    oldData: existing,
    ipAddress: req.ip,
    userAgent: typeof userAgent === 'string' ? userAgent : undefined,
  });
  
  res.json({
    success: true,
    data: { message: "Hosting deletado com sucesso" },
  });
});
